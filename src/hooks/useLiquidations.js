import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchLiquidations as okxFetch } from '../api/okx'
import { openBinanceForceOrders, fetchBinanceForceOrders } from '../api/binanceFutures'
import { fetchMultipleSymbolLiquidations } from '../api/coinglass'

export default function useLiquidations({ source = 'OKX', lookbackMin = 30, pollMs = 15000, enabled = true } = {}) {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
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
        setError(null)
        if (source === 'Binance') {
          try {
            const seedList = await fetchBinanceForceOrders(100)
            if (!cancelled && seedList.length > 0) {
              setEvents((prev) => prune([...(prev || []), ...seedList]).sort((a,b)=>a.ts-b.ts))
            } else if (!cancelled && seedList.length === 0) {
              setError('Binance liquidation data unavailable. API may be down or rate-limited.')
            }
          } catch (err) {
            console.error('Binance liquidations error:', err)
            if (!cancelled) setError(`Binance API error: ${err.response?.status || 'Network error'}. Try OKX source.`)
          }
        } else if (source === 'Coinglass') {
          // Coinglass API currently unavailable (requires API key)
          setError('Coinglass API requires authentication. Please use OKX or Binance source.')
          if (!cancelled) setEvents([])
          return
        } else {
          // OKX
          try {
            const [swap, fut] = await Promise.allSettled([
              okxFetch({ instType: 'SWAP', limit: 100 }),
              okxFetch({ instType: 'FUTURES', limit: 100 }),
            ])

            const swapData = swap.status === 'fulfilled' ? swap.value : []
            const futData = fut.status === 'fulfilled' ? fut.value : []
            const merge = [...swapData, ...futData]
            const usdt = merge.filter((e) => e.instId?.includes('USDT'))

            if (!cancelled) {
              if (usdt.length > 0) {
                setEvents((prev) => prune([...(prev || []), ...usdt]).sort((a,b)=>a.ts-b.ts))
              } else {
                // Check if both failed
                if (swap.status === 'rejected' && fut.status === 'rejected') {
                  setError('OKX liquidation API unavailable. Check network or try Binance source.')
                } else {
                  setError('No recent liquidation events found.')
                }
              }
            }
          } catch (err) {
            console.error('OKX liquidations error:', err)
            if (!cancelled) setError(`OKX API error: ${err.message}. Try Binance source.`)
          }
        }
      } catch (err) {
        console.error('Liquidations fetch error:', err)
        if (!cancelled) setError(err.message || 'Failed to fetch liquidations')
      }
    }
    seed()

    if (source === 'Binance') {
      try {
        unsubRef.current = openBinanceForceOrders((ev) => {
          setError(null) // Clear error on successful WebSocket event
          setEvents((prev) => prune([...(prev || []), ev]).sort((a,b)=>a.ts-b.ts))
        })
      } catch (wsError) {
        console.warn('Binance WebSocket failed:', wsError)
        setError('Binance WebSocket unavailable. Showing initial data only.')
      }
      return () => { if (unsubRef.current) unsubRef.current() }
    } else if (source === 'Coinglass') {
      // No polling for Coinglass since it's unavailable
      return
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

  return { events: prune(events).slice().reverse(), summary, error }
}

