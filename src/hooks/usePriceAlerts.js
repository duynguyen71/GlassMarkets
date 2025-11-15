import { useEffect, useRef } from 'react'
import { useNotify } from '../state/notify'
import { friendlySymbol } from '../utils/symbol'

export default function usePriceAlerts({ tickers, thresholdPct = 50, enabled = true, source = 'OKX' }) {
  const { enabled: notifyOn, notify } = useNotify()
  const sentRef = useRef(new Set())

  useEffect(() => {
    if (!enabled || !notifyOn || !Array.isArray(tickers) || tickers.length === 0) return
    for (const t of tickers) {
      const pct = Number(t.change24hPct || 0)
      if (pct >= thresholdPct) {
        const key = `${t.symbol}|${thresholdPct}`
        if (!sentRef.current.has(key)) {
          sentRef.current.add(key)
          const title = `${friendlySymbol(t.symbol, 'SPOT')} up ${pct.toFixed(1)}%`
          notify(title, {
            body: `${source}: 24h change crossed ${thresholdPct}%`,
            icon: '/pepe.svg',
          })
        }
      }
    }
  }, [tickers, thresholdPct, enabled, notifyOn, notify, source])
}

