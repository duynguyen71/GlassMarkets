import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchFuturesTickers, openOkxTickerStream } from '../api/okx'

export default function useOkxFuturesTickers({ enabled = true, offload = true } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubRef = useRef(null)
  const mapRef = useRef(new Map())
  const workerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        if (offload && typeof Worker !== 'undefined') {
          const worker = new Worker(new URL('../workers/futuresWorker.js', import.meta.url), { type: 'module' })
          workerRef.current = worker
          worker.onmessage = (ev) => {
            const msg = ev.data || {}
            if (msg.type === 'update') {
              setData(msg.data || [])
            } else if (msg.type === 'error') {
              setError(new Error(msg.error))
            }
          }
          worker.postMessage({ type: 'start' })
          return () => { worker.terminate() }
        } else {
          const tickers = await fetchFuturesTickers()
          if (cancelled) return
          const all = tickers.slice().sort((a, b) => (b.volCcy24h || 0) - (a.volCcy24h || 0))
          setData(all)
          mapRef.current = new Map(all.map((t) => [t.symbol, t]))

          const topN = all.slice(0, 40).map((t) => t.symbol)
          unsubRef.current = openOkxTickerStream(topN, (tick) => {
            mapRef.current.set(tick.symbol, { ...(mapRef.current.get(tick.symbol) || {}), ...tick })
          })

          let raf = null
          const pump = () => { raf = null; setData(Array.from(mapRef.current.values())) }
          const loop = () => { if (!raf) raf = requestAnimationFrame(pump) }
          const id = setInterval(loop, 500)
          return () => { clearInterval(id); if (raf) cancelAnimationFrame(raf) }
        }
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const cleanup = load()
    return () => { cancelled = true; if (unsubRef.current) unsubRef.current(); if (workerRef.current) workerRef.current.terminate(); if (cleanup instanceof Function) cleanup() }
  }, [enabled, offload])

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
