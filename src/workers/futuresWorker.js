// Web Worker to fetch and stream OKX futures tickers without touching main thread.

const OKX_REST = 'https://www.okx.com'
const OKX_WS = 'wss://ws.okx.com:8443/ws/v5/public'

let ws = null
let timer = null
let alive = false
let map = new Map()

async function fetchFutures() {
  const url = `${OKX_REST}/api/v5/market/tickers?instType=FUTURES`
  const r = await fetch(url, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  const list = j?.data || []
  return list.map(normalize)
}

function normalize(d) {
  const last = parseFloat(d.last)
  const open24h = parseFloat(d.open24h)
  const changePct = open24h ? ((last - open24h) / open24h) * 100 : 0
  return {
    exchange: 'OKX',
    symbol: d.instId,
    base: d.instId?.split('-')[0],
    quote: d.instId?.split('-')[1],
    last,
    open24h,
    high24h: parseFloat(d.high24h),
    low24h: parseFloat(d.low24h),
    vol24h: parseFloat(d.vol24h),
    volCcy24h: parseFloat(d.volCcy24h),
    change24hPct: changePct,
    ts: Number(d.ts) || Date.now(),
  }
}

function postSnapshot() {
  try {
    const arr = Array.from(map.values())
    postMessage({ type: 'update', data: arr })
  } catch {}
}

function subscribeTop(symbols) {
  if (!symbols?.length) return
  ws = new WebSocket(OKX_WS)
  ws.onopen = () => {
    const args = symbols.map((s) => ({ channel: 'tickers', instId: s }))
    ws.send(JSON.stringify({ op: 'subscribe', args }))
  }
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg?.arg?.channel === 'tickers' && Array.isArray(msg.data)) {
        for (const d of msg.data) {
          const t = normalize(d)
          map.set(t.symbol, { ...(map.get(t.symbol) || {}), ...t })
        }
      }
    } catch {}
  }
  ws.onerror = () => {}
  ws.onclose = () => {}

  // ping keepalive
  const ping = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ op: 'ping' })) } catch {}
    }
  }, 20000)
  return () => { clearInterval(ping); try { ws && ws.close() } catch {} }
}

async function start() {
  alive = true
  try {
    const all = await fetchFutures()
    all.sort((a, b) => (b.volCcy24h || 0) - (a.volCcy24h || 0))
    map = new Map(all.map((t) => [t.symbol, t]))
    postSnapshot()
    const top = all.slice(0, 40).map((t) => t.symbol)
    const unsub = subscribeTop(top)
    timer = setInterval(postSnapshot, 500)
    return () => { unsub && unsub() }
  } catch (e) {
    postMessage({ type: 'error', error: String(e.message || e) })
  }
}

function stop() {
  alive = false
  if (timer) { clearInterval(timer); timer = null }
  if (ws) { try { ws.close() } catch {}; ws = null }
}

self.addEventListener('message', (e) => {
  const { type } = e.data || {}
  if (type === 'start') start()
  if (type === 'stop') stop()
})
