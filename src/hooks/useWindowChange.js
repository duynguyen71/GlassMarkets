import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchCandles as okxCandles } from '../api/okx'
import { fetchKlinesBinance as bnKlines } from '../api/binance'

const MAP = {
  '1h': { okx: '1H', bn: '1h', candles: 2 },
  '4h': { okx: '4H', bn: '4h', candles: 2 },
}

export default function useWindowChange(tickers, source = 'OKX', win = '24h', limit = 60) {
  // Store historical prices instead of percentages
  const [historicalPrices, setHistoricalPrices] = useState({})
  const inFlight = useRef(new Set())

  // 24h uses built-in change; compute only for 1h/4h
  useEffect(() => {
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) return
    if (win === '24h') { setHistoricalPrices({}); return }
    const cfg = MAP[win]
    if (!cfg) { setHistoricalPrices({}); return }
    const slice = tickers.slice(0, limit)

    let cancelled = false

    async function fetchHistoricalPrices() {
      const entries = await Promise.allSettled(slice.map(async (row) => {
        // Skip if already fetching this symbol
        if (inFlight.current.has(row.symbol)) {
          return null
        }

        inFlight.current.add(row.symbol)
        try {
          let historicalPrice = null

          if (source === 'Binance') {
            // Fetch 2 candles to get the historical price
            // Binance returns oldest first: [oldest, newest]
            const k = await bnKlines(row.symbol, { interval: cfg.bn, limit: cfg.candles })
            if (k && k.length >= 2) {
              // k[0] is the oldest (completed) candle
              const oldClose = Number(k[0][4]) // close price of old candle
              if (isFinite(oldClose) && oldClose > 0) {
                historicalPrice = oldClose
              }
            }
          } else {
            // Fetch 2 candles from OKX
            // OKX returns newest first: [newest, oldest]
            const c = await okxCandles(row.symbol, { bar: cfg.okx, limit: cfg.candles })
            if (c && c.length >= 2) {
              // c[c.length - 1] is the oldest candle
              const oldClose = Number(c[c.length - 1][4]) // [4] is close price
              if (isFinite(oldClose) && oldClose > 0) {
                historicalPrice = oldClose
              }
            }
          }
          return { symbol: row.symbol, historicalPrice }
        } catch (err) {
          console.error(`Error fetching historical price for ${row.symbol}:`, err)
          return { symbol: row.symbol, historicalPrice: null }
        } finally {
          inFlight.current.delete(row.symbol)
        }
      }))
      if (cancelled) return
      const next = {}
      for (const r of entries) {
        if (r.status === 'fulfilled' && r.value && r.value.symbol) {
          next[r.value.symbol] = r.value.historicalPrice
        }
      }
      setHistoricalPrices((prev) => ({ ...prev, ...next }))
    }

    // Fetch historical prices immediately
    fetchHistoricalPrices()

    // Refresh historical prices every 5 minutes to keep them current
    const interval = setInterval(() => {
      if (!cancelled) {
        fetchHistoricalPrices()
      }
    }, 5 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tickers, source, win, limit])

  // Calculate percentages on every render using current prices
  const percentageMap = useMemo(() => {
    if (win === '24h' || !tickers || !Array.isArray(tickers)) return {}

    const result = {}
    for (const ticker of tickers.slice(0, limit)) {
      const currentPrice = Number(ticker.last)
      const historicalPrice = historicalPrices[ticker.symbol]

      if (isFinite(currentPrice) && currentPrice > 0 && isFinite(historicalPrice) && historicalPrice > 0) {
        result[ticker.symbol] = ((currentPrice - historicalPrice) / historicalPrice) * 100
      } else {
        result[ticker.symbol] = null
      }
    }
    return result
  }, [tickers, historicalPrices, win, limit])

  return percentageMap
}

