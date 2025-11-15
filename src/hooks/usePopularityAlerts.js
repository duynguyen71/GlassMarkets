import { useEffect, useMemo, useRef } from 'react'
import { useNotify } from '../state/notify'
import { useSearch } from '../state/search'

export default function usePopularityAlerts({ tickers, enabled = true, threshold = 3, source = 'OKX' }) {
  const { enabled: notifyOn, notify } = useNotify()
  const { counts } = useSearch()
  const sentRef = useRef(new Set())

  const hotBases = useMemo(() => {
    return Object.entries(counts)
      .filter(([, cnt]) => cnt >= threshold)
      .map(([base]) => base)
  }, [counts, threshold])

  useEffect(() => {
    if (!enabled || !notifyOn || hotBases.length === 0 || !Array.isArray(tickers) || tickers.length === 0) return
    const index = new Map(tickers.map((t) => [t.base?.toUpperCase(), t]))
    for (const base of hotBases) {
      const t = index.get(base)
      if (!t) continue
      const key = `popular|${base}`
      if (!sentRef.current.has(key)) {
        sentRef.current.add(key)
        notify(`${base} is trending`, {
          body: `${source}: users searched ${base} frequently`,
          icon: '/pepe.svg',
        })
      }
    }
  }, [hotBases, tickers, enabled, notifyOn, notify, source])
}

