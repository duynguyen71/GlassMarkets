import { Box, Text, Spinner } from '@chakra-ui/react'
import SummaryBar from '../components/SummaryBar'
import TopMovers from '../components/TopMovers'
import TickerTable from '../components/TickerTable'
import useBinanceAlphaCoins from '../hooks/useBinanceAlphaCoins'

export default function BinanceAlphaView({ tickers, loading, onSelect }) {
  const { alphaCoins, loading: loadingAlpha, error: alphaError } = useBinanceAlphaCoins()

  // Create a Set for fast lookup
  const alphaSet = new Set(alphaCoins.map(c => c.toUpperCase()))

  // Filter tickers that are in the Binance Alpha list
  const alphaCoinsData = (tickers || []).filter((t) => alphaSet.has(String(t.base).toUpperCase()))

  const summary = summarize(alphaCoinsData)

  return (
    <Box>
      {loadingAlpha && (
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Spinner size="sm" />
          <Text fontSize="sm" color="gray.500">Loading Binance Alpha coins list...</Text>
        </Box>
      )}
      {alphaError && (
        <Box mb={4}>
          <Text fontSize="sm" color="orange.400">Using fallback Binance Alpha list</Text>
        </Box>
      )}
      <Box mb={4}>
        <SummaryBar summary={summary} loading={loading} />
      </Box>
      <Box mb={4}>
        <TopMovers tickers={alphaCoinsData} onSelect={onSelect} loading={loading} />
      </Box>
      <TickerTable tickers={alphaCoinsData} onSelect={onSelect} loading={loading} />
    </Box>
  )
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
