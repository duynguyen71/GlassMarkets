import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchLiquidations } from '../api/okx'

export default function useOkxLiquidations({ lookbackMin = 30, pollMs = 15000, enabled = true } = {}) {
  const [events, setEvents] = useState([])
  const timerRef = useRef(null)
  const cutoffRef = useRef(Date.now() - lookbackMin * 60_000)

  const prune = (list) => {
    const cutoff = Date.now() - lookbackMin * 60_000
    cutoffRef.current = cutoff
    return (list || []).filter((e) => (e.ts || 0) >= cutoff)
  }

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function tick() {
      try {
        const [swap, fut] = await Promise.allSettled([
          fetchLiquidations({ instType: 'SWAP', limit: 100 }),
          fetchLiquidations({ instType: 'FUTURES', limit: 100 }),
        ])
        if (cancelled) return
        const merge = [
          ...(swap.status === 'fulfilled' ? swap.value : []),
          ...(fut.status === 'fulfilled' ? fut.value : []),
        ]
        // Keep USDT-related instruments to align with rest of app
        const usdt = merge.filter((e) => e.instId?.includes('USDT'))
        // Merge and prune
        setEvents((prev) => {
          const combined = [...prev, ...usdt]
          combined.sort((a, b) => (a.ts || 0) - (b.ts || 0))
          return prune(combined)
        })
      } catch {}
    }

    tick()
    timerRef.current = setInterval(tick, pollMs)
    return () => { cancelled = true; if (timerRef.current) clearInterval(timerRef.current) }
  }, [enabled, pollMs, lookbackMin])

  // Build summary
  const summary = useMemo(() => {
    const list = prune(events)
    const total = list.length
    let longs = 0
    let shorts = 0
    for (const e of list) {
      if (e.side === 'long') longs++
      else if (e.side === 'short') shorts++
    }
    return { total, longs, shorts }
  }, [events, lookbackMin])

  return { events: prune(events).slice().reverse(), summary }
}

