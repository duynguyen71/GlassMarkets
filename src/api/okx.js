import axios from 'axios'

const OKX_REST = (import.meta?.env?.DEV ? '/_okx' : 'https://www.okx.com')
const OKX_WS = 'wss://ws.okx.com:8443/ws/v5/public'

export async function fetchSpotTickers() {
  const url = `${OKX_REST}/api/v5/market/tickers?instType=SPOT`
  const res = await axios.get(url, { timeout: 15000 })
  const list = res?.data?.data || []
  return list.map((d) => normalizeTicker(d))
}

export async function fetchFuturesTickers() {
  const url = `${OKX_REST}/api/v5/market/tickers?instType=FUTURES`
  const res = await axios.get(url, { timeout: 15000 })
  const list = res?.data?.data || []
  return list.map((d) => normalizeTicker(d))
}

export function normalizeTicker(d) {
  const last = parseFloat(d.last)
  const open24h = parseFloat(d.open24h)
  const high24h = parseFloat(d.high24h)
  const low24h = parseFloat(d.low24h)
  const vol = parseFloat(d.vol24h)
  const volCcy = parseFloat(d.volCcy24h)
  const changePct = open24h ? ((last - open24h) / open24h) * 100 : 0
  return {
    exchange: 'OKX',
    symbol: d.instId, // e.g., BTC-USDT
    base: d.instId?.split('-')[0],
    quote: d.instId?.split('-')[1],
    last,
    open24h,
    high24h,
    low24h,
    vol24h: vol,
    volCcy24h: volCcy,
    change24hPct: changePct,
    ts: Number(d.ts) || Date.now(),
  }
}

export function openOkxTickerStream(symbols, onUpdate) {
  if (!symbols?.length) return () => {}
  const ws = new WebSocket(OKX_WS)
  let alive = true

  const subscribe = () => {
    const args = symbols.map((s) => ({ channel: 'tickers', instId: s }))
    ws.send(JSON.stringify({ op: 'subscribe', args }))
  }

  ws.onopen = () => {
    subscribe()
  }

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg?.event === 'subscribe' || msg?.event === 'pong') return
      if (msg?.arg?.channel === 'tickers' && Array.isArray(msg.data)) {
        for (const d of msg.data) {
          onUpdate(normalizeTicker(d))
        }
      }
    } catch {}
  }

  // keepalive ping
  const pingId = setInterval(() => {
    if (alive && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ op: 'ping' })) } catch {}
    }
  }, 20000)

  ws.onclose = () => { alive = false; clearInterval(pingId) }
  ws.onerror = () => {}

  return () => { try { alive = false; clearInterval(pingId); ws.close() } catch {} }
}

// --- Open Interest helpers ---
export async function fetchSwapInstruments() {
  const url = `${OKX_REST}/api/v5/public/instruments?instType=SWAP`
  const res = await axios.get(url, { timeout: 15000 })
  return res?.data?.data || []
}

// --- Candles / Volume helpers ---
export async function fetchDailyCandles(instId, limit = 8) {
  const url = `${OKX_REST}/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=1D&limit=${limit}`
  const res = await axios.get(url, { timeout: 15000 })
  // OKX returns array of arrays sorted most-recent first: [ts, o, h, l, c, vol, volCcy, volCcyQuote] (fields may vary)
  return res?.data?.data || []
}

export async function fetchCandles(instId, { bar = '5m', limit = 60 } = {}) {
  const url = `${OKX_REST}/api/v5/market/candles?instId=${encodeURIComponent(instId)}&bar=${encodeURIComponent(bar)}&limit=${limit}`
  const res = await axios.get(url, { timeout: 15000 })
  return res?.data?.data || []
}

export async function fetchDailyAvgQuoteVolume(instId, lookback = 7) {
  try {
    const rows = await fetchDailyCandles(instId, lookback + 1)
    if (!rows?.length) return null
    // drop the first (current/partial) candle, average the next lookback rows
    const closed = rows.slice(1)
    const take = closed.slice(0, lookback)
    if (!take.length) return null
    let sum = 0
    let count = 0
    for (const r of take) {
      const volCcy = Number(r[6] ?? r[5] ?? 0)
      if (!Number.isNaN(volCcy) && volCcy > 0) { sum += volCcy; count += 1 }
    }
    if (!count) return null
    return sum / count
  } catch (e) {
    return null
  }
}

// --- Liquidation orders ---
// Fetch recent liquidation orders. OKX supports instType: SWAP/FUTURES
export async function fetchLiquidations({ instType = 'SWAP', before, after, limit = 100 } = {}) {
  const params = new URLSearchParams({ instType })
  if (before) params.set('before', String(before))
  if (after) params.set('after', String(after))
  if (limit) params.set('limit', String(limit))
  const url = `${OKX_REST}/api/v5/public/liquidation-orders?${params.toString()}`
  const res = await axios.get(url, { timeout: 15000 })
  const list = res?.data?.data || []
  return list.map(normalizeLiq)
}

export function normalizeLiq(d) {
  // Fields can vary; try to coerce sensibly
  const instId = d.instId || d.inst || ''
  const side = (d.posSide || d.side || '').toLowerCase() // long or short
  const sz = Number(d.sz || d.size || 0)
  const px = Number(d.bkPx || d.px || d.price || 0)
  const ts = Number(d.ts || d.fillTime || Date.now())
  const base = instId.split('-')[0] || ''
  return { instId, side, sz, px, ts, base }
}

export async function fetchOpenInterest(instId) {
  const url = `${OKX_REST}/api/v5/public/open-interest?instId=${encodeURIComponent(instId)}`
  const res = await axios.get(url, { timeout: 15000 })
  const d = res?.data?.data?.[0]
  if (!d) return null
  return normalizeOpenInterest(d)
}

export async function fetchOpenInterestBulk(instIds = []) {
  const results = await Promise.allSettled(instIds.map((id) => fetchOpenInterest(id)))
  return results
    .map((r, i) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean)
}

export function normalizeOpenInterest(d) {
  return {
    instId: d.instId, // e.g., BTC-USDT-SWAP
    instType: d.instType || (d.instId?.split('-')[2] || '').toUpperCase(),
    base: d.instId?.split('-')[0],
    quote: d.instId?.split('-')[1],
    oi: Number(d.oi), // contracts
    oiCcy: Number(d.oiCcy), // in currency
    ts: Number(d.ts) || Date.now(),
  }
}
