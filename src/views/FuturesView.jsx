import { Box } from '@chakra-ui/react'
import SummaryBar from '../components/SummaryBar'
import TopMovers from '../components/TopMovers'
import TickerTable from '../components/TickerTable'
import useOkxFuturesTickers from '../hooks/useOkxFuturesTickers'

export default function FuturesView({ active = true, onSelect }) {
  const { tickers, loading, summary } = useOkxFuturesTickers({ enabled: active })
  return (
    <Box>
      <Box mb={4}>
        <SummaryBar summary={summary} loading={loading} />
      </Box>
      <Box mb={4}>
        <TopMovers tickers={tickers} symbolType="FUTURES" onSelect={onSelect} loading={loading} />
      </Box>
      <TickerTable tickers={tickers} symbolType="FUTURES" typeLabel="Futures" defaultPageSize={50} onSelect={onSelect} loading={loading} />
    </Box>
  )
}
