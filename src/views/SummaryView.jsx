import { Box } from '@chakra-ui/react'
import SummaryBar from '../components/SummaryBar'
import TopMovers from '../components/TopMovers'
import TickerTable from '../components/TickerTable'

export default function SummaryView({ tickers, loading, summary, onSelect }) {
  return (
    <Box>
      <Box mb={4}>
        <SummaryBar summary={summary} loading={loading} />
      </Box>
      <Box mb={4}>
        <TopMovers tickers={tickers} onSelect={onSelect} loading={loading} />
      </Box>
      <TickerTable tickers={tickers} onSelect={onSelect} loading={loading} />
    </Box>
  )
}
