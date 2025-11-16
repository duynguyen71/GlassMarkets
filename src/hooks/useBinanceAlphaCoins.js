import { useEffect, useState } from 'react'
import { fetchBinanceAlphaCoins } from '../api/binance'

export default function useBinanceAlphaCoins() {
  const [alphaCoins, setAlphaCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadAlphaCoins() {
      try {
        setLoading(true)
        const coins = await fetchBinanceAlphaCoins()
        if (mounted) {
          setAlphaCoins(coins)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err)
          console.error('Error fetching Binance Alpha coins:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAlphaCoins()

    // Refresh every hour
    const interval = setInterval(loadAlphaCoins, 60 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { alphaCoins, loading, error }
}
