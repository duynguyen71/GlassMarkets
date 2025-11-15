import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchSpotTickers, openOkxTickerStream } from '../api/okx'

export default function useOkxTickers() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubRef = useRef(null)
  const mapRef = useRef(new Map())

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const tickers = await fetchSpotTickers()
        if (cancelled) return
        // Prefer USDT pairs for consistency
        const usdt = tickers.filter((t) => t.quote === 'USDT')
        // sort by quote volume desc
        usdt.sort((a, b) => (b.volCcy24h || 0) - (a.volCcy24h || 0))
        setData(usdt)
        // seed map
        mapRef.current = new Map(usdt.map((t) => [t.symbol, t]))

        // Subscribe to top N by volume
        const topN = usdt.slice(0, 40).map((t) => t.symbol)
        unsubRef.current = openOkxTickerStream(topN, (tick) => {
          mapRef.current.set(tick.symbol, { ...(mapRef.current.get(tick.symbol) || {}), ...tick })
        })

        // throttle state updates
        let raf = null
        const pump = () => {
          raf = null
          setData(Array.from(mapRef.current.values()))
        }
        const loop = () => { if (!raf) raf = requestAnimationFrame(pump) }
        const id = setInterval(loop, 500)
        return () => { clearInterval(id); if (raf) cancelAnimationFrame(raf) }
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const cleanup = load()
    return () => { cancelled = true; if (unsubRef.current) unsubRef.current(); if (cleanup instanceof Function) cleanup() }
  }, [])

  const summary = useMemo(() => summarize(data), [data])

  return { tickers: data, loading, error, summary }
}

function summarize(list) {
  if (!list?.length) return { totalPairs: 0, totalQuoteVolume: 0, advancers: 0, decliners: 0, avgChangePct: 0 }
  const totalPairs = list.length
  let totalQuoteVolume = 0
  let advancers = 0
  let decliners = 0
  let sumChange = 0
  for (const t of list) {
    totalQuoteVolume += Number(t.volCcy24h || 0)
    const ch = Number(t.change24hPct || 0)
    sumChange += ch
    if (ch > 0) advancers += 1
    else if (ch < 0) decliners += 1
  }
  const avgChangePct = sumChange / totalPairs
  return { totalPairs, totalQuoteVolume, advancers, decliners, avgChangePct }
}

