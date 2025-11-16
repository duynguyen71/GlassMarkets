import { Box, Button, Flex, Icon } from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import SummaryBar from '../components/SummaryBar'
import TopMovers from '../components/TopMovers'
import TickerTable from '../components/TickerTable'
import useLocalStorage from '../hooks/useLocalStorage'
import { useI18n } from '../i18n'

export default function SummaryView({ tickers, loading, summary, onSelect }) {
  const [showSummary, setShowSummary] = useLocalStorage('pref:showSummary', true)
  const { t } = useI18n()

  return (
    <Box>
      <Flex justify="flex-end" mb={3}>
        <Button
          size="sm"
          variant="outline"
          borderRadius="full"
          leftIcon={showSummary ? <ViewOffIcon /> : <ViewIcon />}
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? t('summary.hideHighlights') : t('summary.showHighlights')}
        </Button>
      </Flex>

      {showSummary && (
        <>
          <Box mb={4}>
            <SummaryBar summary={summary} loading={loading} />
          </Box>
          <Box mb={4}>
            <TopMovers tickers={tickers} onSelect={onSelect} loading={loading} />
          </Box>
        </>
      )}

      <TickerTable tickers={tickers} onSelect={onSelect} loading={loading} />
    </Box>
  )
}
