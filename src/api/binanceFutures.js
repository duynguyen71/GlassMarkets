import axios from 'axios'

const BINANCE_FUT_WS = 'wss://fstream.binance.com/stream?streams=forceOrder@arr'
const BINANCE_FUT_REST = (import.meta?.env?.DEV ? '/_bnf' : (import.meta?.env?.VITE_PROXY_BASE ? `${import.meta.env.VITE_PROXY_BASE}/bn` : 'https://fapi.binance.com'))

export function openBinanceForceOrders(onEvent) {
  const ws = new WebSocket(BINANCE_FUT_WS)
  let isConnected = false

  ws.onopen = () => {
    isConnected = true
    console.log('Binance WebSocket connected')
  }

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (!msg?.data || !Array.isArray(msg.data)) return
      for (const e of msg.data) {
        if (!e?.o) continue
        const o = e.o
        const side = (o.S || '').toLowerCase() // BUY/SELL
        const sym = o.s
        const px = Number(o.ap || o.p || 0)
        const qty = Number(o.q || 0)
        const ts = Number(o.T || Date.now())
        onEvent({ instId: sym, side: side === 'buy' ? 'long' : 'short', sz: qty, px, ts, base: sym.replace(/USDT|USD$/,'') })
      }
    } catch (err) {
      console.warn('Binance WebSocket message parse error:', err)
    }
  }

  ws.onerror = (err) => {
    console.error('Binance WebSocket error:', err)
  }

  ws.onclose = () => {
    if (isConnected) {
      console.log('Binance WebSocket disconnected')
    } else {
      console.warn('Binance WebSocket failed to connect')
    }
  }

  return () => {
    try {
      ws.close()
    } catch (err) {
      console.warn('Error closing WebSocket:', err)
    }
  }
}

export async function fetchBinanceForceOrders(limit = 50) {
  // Binance requires symbol param for /allForceOrders; fetch for top symbols
  const syms = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT']

  try {
    const results = await Promise.allSettled(
      syms.map((s) =>
        axios.get(`${BINANCE_FUT_REST}/fapi/v1/allForceOrders`, {
          params: { symbol: s, limit },
          timeout: 15000
        })
      )
    )

    const list = []
    let successCount = 0

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value?.data) {
        successCount++
        for (const it of r.value.data) {
          list.push({
            instId: it.symbol,
            side: (it.side || '').toLowerCase() === 'buy' ? 'long' : 'short',
            sz: Number(it.origQty || 0),
            px: Number(it.price || 0),
            ts: Number(it.time || 0),
            base: it.symbol.replace(/USDT|USD$/, '')
          })
        }
      }
    }

    // If all requests failed, throw error to trigger error handling in hook
    if (successCount === 0) {
      throw new Error('All Binance API requests failed')
    }

    return list
  } catch (error) {
    // Re-throw to be handled by useLiquidations hook
    throw error
  }
}

