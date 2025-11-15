import { useEffect, useMemo, useState } from 'react'
import { fetchOpenInterestBulk, fetchSwapInstruments } from '../api/okx'

// Loads USDT-settled perpetual swaps and fetches their open interest.
export default function useOkxOpenInterest({ limit = 20, refreshMs = 60_000, enabled = true } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let intervalId = null

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const instruments = await fetchSwapInstruments()
        if (cancelled) return
        // Prefer USDT-settled perpetuals and active state
        const usdt = instruments.filter((i) => (i.settleCcy === 'USDT' || i.quoteCcy === 'USDT') && i.state === 'live')
        // put majors first by a simple rank list
        const priority = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'TON', 'ADA', 'AVAX', 'LINK']
        usdt.sort((a, b) => {
          const ai = priority.indexOf(a.instId.split('-')[0])
          const bi = priority.indexOf(b.instId.split('-')[0])
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.instId.localeCompare(b.instId)
        })
        const pick = usdt.slice(0, limit)
        const instIds = pick.map((i) => i.instId)
        const data = await fetchOpenInterestBulk(instIds)
        if (cancelled) return
        setItems(data)

        if (refreshMs > 0) {
          intervalId = setInterval(async () => {
            try {
              const d2 = await fetchOpenInterestBulk(instIds)
              if (!cancelled) setItems(d2)
            } catch {}
          }, refreshMs)
        }
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true; if (intervalId) clearInterval(intervalId) }
  }, [limit, refreshMs, enabled])

  const totalOiCcy = useMemo(() => items.reduce((s, it) => s + Number(it.oiCcy || 0), 0), [items])

  return { items, loading, error, totalOiCcy }
}
