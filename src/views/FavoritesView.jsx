import { Box, Heading, Text } from '@chakra-ui/react'
import { useFavorites } from '../state/favorites'
import { useI18n } from '../i18n'
import Glass from '../components/Glass'
import TickerTable from '../components/TickerTable'

export default function FavoritesView({ tickers, loading, onSelect }) {
  const { t } = useI18n()
  const { favorites } = useFavorites()
  const favoriteTickers = (tickers || []).filter((ticker) => favorites.includes(ticker.symbol))

  return (
    <Box>
      <Heading size="md" mb={3}>{t('favorites.title')}</Heading>
      {!loading && favoriteTickers.length === 0 ? (
        <Glass p={4} mb={4}>
          <Text color="gray.400">{t('favorites.empty')}</Text>
        </Glass>
      ) : null}
      <TickerTable tickers={favoriteTickers} onSelect={onSelect} loading={loading} />
    </Box>
  )
}
