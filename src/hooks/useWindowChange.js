import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchCandles as okxCandles } from '../api/okx'
import { fetchKlinesBinance as bnKlines } from '../api/binance'

const MAP = {
  '1h': { okx: '1H', bn: '1h' },
  '4h': { okx: '4H', bn: '4h' },
}

export default function useWindowChange(tickers, source = 'OKX', win = '24h', limit = 60) {
  const [map, setMap] = useState({})
  const inFlight = useRef(new Set())

  // 24h uses built-in change; compute only for 1h/4h
  useEffect(() => {
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) return
    if (win === '24h') { setMap({}); return }
    const cfg = MAP[win]
    if (!cfg) { setMap({}); return }
    const slice = tickers.slice(0, limit)

    let cancelled = false
    async function run() {
      const entries = await Promise.allSettled(slice.map(async (row) => {
        if (inFlight.current.has(row.symbol)) return null
        inFlight.current.add(row.symbol)
        try {
          let pct = null
          if (source === 'Binance') {
            const k = await bnKlines(row.symbol, { interval: cfg.bn, limit: 2 })
            if (k && k.length >= 2) {
              const prev = Number(k[k.length - 2][4])
              const last = Number(k[k.length - 1][4])
              if (isFinite(prev) && isFinite(last) && prev !== 0) pct = ((last - prev) / prev) * 100
            }
          } else {
            const c = await okxCandles(row.symbol, { bar: cfg.okx, limit: 2 })
            if (c && c.length >= 2) {
              // OKX returns newest first
              const last = Number(c[0][4])
              const prev = Number(c[1][4])
              if (isFinite(prev) && isFinite(last) && prev !== 0) pct = ((last - prev) / prev) * 100
            }
          }
          return { symbol: row.symbol, pct }
        } catch {
          return { symbol: row.symbol, pct: null }
        } finally {
          inFlight.current.delete(row.symbol)
        }
      }))
      if (cancelled) return
      const next = {}
      for (const r of entries) {
        if (r.status === 'fulfilled' && r.value && r.value.symbol) next[r.value.symbol] = r.value.pct
      }
      setMap((m) => ({ ...m, ...next }))
    }
    run()
    return () => { cancelled = true }
  }, [tickers, source, win, limit])

  return map
}

