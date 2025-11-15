import { Box } from '@chakra-ui/react'
import SummaryBar from '../components/SummaryBar'
import TopMovers from '../components/TopMovers'
import TickerTable from '../components/TickerTable'
import { isAICoinBase } from '../data/aiCoins'

export default function AICoinsView({ tickers, loading, onSelect }) {
  const ai = (tickers || []).filter((t) => isAICoinBase(t.base))
  const summary = summarize(ai)
  return (
    <Box>
      <Box mb={4}>
        <SummaryBar summary={summary} loading={loading} />
      </Box>
      <Box mb={4}>
        <TopMovers tickers={ai} onSelect={onSelect} loading={loading} />
      </Box>
      <TickerTable tickers={ai} onSelect={onSelect} loading={loading} />
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
