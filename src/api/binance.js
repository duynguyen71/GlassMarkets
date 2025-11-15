import axios from 'axios'

const BINANCE_REST = (import.meta?.env?.DEV ? '/_bn' : 'https://api.binance.com')
const BINANCE_WS = 'wss://stream.binance.com:9443/stream'

function toInstId(sym) {
  // e.g. BTCUSDT -> BTC-USDT, ETHUSDC -> ETH-USDC
  const quoteCandidates = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD']
  for (const q of quoteCandidates) {
    if (sym.endsWith(q)) return sym.slice(0, sym.length - q.length) + '-' + q
  }
  return sym
}

function toBinanceSymbol(instId) {
  return String(instId).replace(/-/g, '').toUpperCase()
}

export function normalizeTicker(d) {
  const symbol = toInstId(d.symbol)
  const last = parseFloat(d.lastPrice)
  const open24h = parseFloat(d.openPrice)
  const high24h = parseFloat(d.highPrice)
  const low24h = parseFloat(d.lowPrice)
  const volCcy = parseFloat(d.quoteVolume) // 24h quote volume
  const changePct = open24h ? ((last - open24h) / open24h) * 100 : 0
  const [base, quote] = symbol.split('-')
  return {
    exchange: 'Binance',
    symbol,
    base,
    quote,
    last,
    open24h,
    high24h,
    low24h,
    vol24h: parseFloat(d.volume),
    volCcy24h: volCcy,
    change24hPct: changePct,
    ts: Date.now(),
  }
}

export async function fetchSpotTickersBinance() {
  const url = `${BINANCE_REST}/api/v3/ticker/24hr`
  const res = await axios.get(url, { timeout: 15000 })
  const list = res?.data || []
  // Keep major quote assets only for consistency
  const norm = list.map(normalizeTicker).filter((t) => ['USDT', 'USDC'].includes(t.quote))
  return norm
}

export function openBinanceTickerStream(instIds, onUpdate) {
  if (!instIds?.length) return () => {}
  // Convert to binance lowercase symbols without dash: BTC-USDT -> btcusdt
  const streams = instIds.map((id) => id.replace('-', '').toLowerCase() + '@ticker').join('/')
  const url = `${BINANCE_WS}?streams=${streams}`
  const ws = new WebSocket(url)
  let alive = true

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      const d = msg?.data
      if (!d) return
      const norm = normalizeTicker({
        symbol: d.s,
        lastPrice: d.c,
        openPrice: d.o,
        highPrice: d.h,
        lowPrice: d.l,
        volume: d.v,
        quoteVolume: d.q,
      })
      onUpdate(norm)
    } catch {}
  }
  ws.onclose = () => { alive = false }
  ws.onerror = () => {}
  return () => { try { alive = false; ws.close() } catch {} }
}

export async function fetchKlinesBinance(instId, { interval = '5m', limit = 60 } = {}) {
  const symbol = toBinanceSymbol(instId)
  const url = `${BINANCE_REST}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await axios.get(url, { timeout: 15000 })
  return res?.data || []
}
