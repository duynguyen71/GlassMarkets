import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchDailyAvgQuoteVolume } from '../api/okx'

// Computes volume surprise ratio vs N-day average for top tickers by 24h quote volume.
export default function useVolumeSurprise({ tickers, lookbackDays = 7, topN = 30, threshold = 2, enabled = true, refreshMs = 180000, sampleMs = 5000 }) {
  const [rowsAvg, setRowsAvg] = useState([]) // rows with avg + static metadata
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tickSnap, setTickSnap] = useState([]) // throttled snapshot of live tickers
  const symbolsRef = useRef([]) // currently analyzed symbol list
  const refreshRef = useRef(null)

  // Throttle live ticker updates so the UI doesn't constantly rerender
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let id
    const push = () => { if (!cancelled) setTickSnap(tickers || []) }
    push()
    id = setInterval(push, sampleMs)
    return () => { cancelled = true; if (id) clearInterval(id) }
  }, [tickers, sampleMs, enabled])

  // Compute the list of top symbols (USDT) by quote volume
  const computeTopSymbols = (list) => {
    return [...(list || [])]
      .filter((t) => t.quote === 'USDT')
      .sort((a, b) => (b.volCcy24h || 0) - (a.volCcy24h || 0))
      .slice(0, topN)
      .map((t) => t.symbol)
  }

  const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

  // Function to fetch averages for current symbolsRef
  const recomputeAverages = async (symbols, baseTickers) => {
    setLoading(true)
    setError(null)
    try {
      const index = new Map((baseTickers || []).map((t) => [t.symbol, t]))
      const results = await Promise.allSettled(symbols.map(async (sym) => {
        const avg = await fetchDailyAvgQuoteVolume(sym, lookbackDays)
        const t = index.get(sym)
        const vol = Number(t?.volCcy24h || 0)
        const ratio = avg ? vol / avg : null
        return { ...t, avgQuoteVol: avg, surpriseRatio: ratio }
      }))
      const data = results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean)
      setRowsAvg(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  // Initial compute and respond to significant top list changes
  useEffect(() => {
    if (!enabled || !tickers?.length) return
    const next = computeTopSymbols(tickers)
    if (!arraysEqual(next, symbolsRef.current)) {
      symbolsRef.current = next
      recomputeAverages(next, tickers)
    }
  }, [tickers, topN, lookbackDays, enabled])

  // Periodic refresh (e.g., every 3 minutes) to refresh averages and ratios
  useEffect(() => {
    if (!enabled) return
    if (refreshRef.current) clearInterval(refreshRef.current)
    refreshRef.current = setInterval(() => {
      if (symbolsRef.current.length) {
        recomputeAverages(symbolsRef.current, tickers)
      }
    }, refreshMs)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [enabled, refreshMs, tickers, lookbackDays, topN])

  // Merge throttled live fields into avg rows so UI updates smoothly
  const sorted = useMemo(() => {
    const index = new Map((tickSnap || []).map((t) => [t.symbol, t]))
    const merged = rowsAvg.map((r) => {
      const t = index.get(r.symbol)
      return t ? { ...r, last: t.last, change24hPct: t.change24hPct, volCcy24h: t.volCcy24h } : r
    })
    return merged
      .filter((r) => r.surpriseRatio != null)
      .sort((a, b) => (b.surpriseRatio || 0) - (a.surpriseRatio || 0))
  }, [rowsAvg, tickSnap])

  const summary = useMemo(() => {
    const count = sorted.length
    const over2 = sorted.filter((r) => (r.surpriseRatio || 0) >= 2).length
    const over3 = sorted.filter((r) => (r.surpriseRatio || 0) >= 3).length
    const bullish = sorted.filter((r) => (r.surpriseRatio || 0) >= threshold && (r.change24hPct || 0) >= 3).length
    const bearish = sorted.filter((r) => (r.surpriseRatio || 0) >= threshold && (r.change24hPct || 0) <= -3).length
    return { count, over2, over3, bullish, bearish }
  }, [sorted, threshold])

  return { rows: sorted, loading, error, summary }
}
