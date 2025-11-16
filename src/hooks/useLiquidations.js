import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchLiquidations as okxFetch } from '../api/okx'
import { openBinanceForceOrders, fetchBinanceForceOrders } from '../api/binanceFutures'
import { fetchMultipleSymbolLiquidations } from '../api/coinglass'

export default function useLiquidations({ source = 'OKX', lookbackMin = 30, pollMs = 15000, enabled = true } = {}) {
  const [events, setEvents] = useState([])
  const unsubRef = useRef(null)

  const prune = (list) => {
    const cutoff = Date.now() - lookbackMin * 60_000
    return (list || []).filter((e) => (e.ts || 0) >= cutoff)
  }

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function seed() {
      try {
        if (source === 'Binance') {
          const seedList = await fetchBinanceForceOrders(100)
          if (!cancelled) setEvents((prev) => prune([...(prev || []), ...seedList]).sort((a,b)=>a.ts-b.ts))
        } else if (source === 'Coinglass') {
          const seedList = await fetchMultipleSymbolLiquidations({
            symbols: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC'],
            limit: 100
          })
          if (!cancelled) setEvents((prev) => prune([...(prev || []), ...seedList]).sort((a,b)=>a.ts-b.ts))
        } else {
          const [swap, fut] = await Promise.allSettled([
            okxFetch({ instType: 'SWAP', limit: 100 }),
            okxFetch({ instType: 'FUTURES', limit: 100 }),
          ])
          const merge = [ ...(swap.status==='fulfilled'?swap.value:[]), ...(fut.status==='fulfilled'?fut.value:[]) ]
          const usdt = merge.filter((e) => e.instId?.includes('USDT'))
          if (!cancelled) setEvents((prev) => prune([...(prev || []), ...usdt]).sort((a,b)=>a.ts-b.ts))
        }
      } catch {}
    }
    seed()

    if (source === 'Binance') {
      unsubRef.current = openBinanceForceOrders((ev) => {
        setEvents((prev) => prune([...(prev || []), ev]).sort((a,b)=>a.ts-b.ts))
      })
      return () => { if (unsubRef.current) unsubRef.current() }
    } else {
      const id = setInterval(seed, pollMs)
      return () => clearInterval(id)
    }
  }, [source, lookbackMin, pollMs, enabled])

  const summary = useMemo(() => {
    const list = prune(events)
    const total = list.length
    let longs = 0
    let shorts = 0
    for (const e of list) { if (e.side === 'long') longs++; else if (e.side === 'short') shorts++ }
    return { total, longs, shorts }
  }, [events, lookbackMin])

  return { events: prune(events).slice().reverse(), summary }
}

