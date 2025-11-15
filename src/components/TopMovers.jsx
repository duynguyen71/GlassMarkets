import { Badge, Box, Flex, Heading, HStack, Skeleton, Text } from '@chakra-ui/react'
import { formatNumber, formatPct, formatPrice } from '../utils/number'
import { friendlySymbol } from '../utils/symbol'
import Glass from './Glass'
import ClickableBadge from './ClickableBadge'
import TokenLogo from './TokenLogo'
import { useI18n } from '../i18n'

export default function TopMovers({ tickers, limit = 5, symbolType = 'SPOT', onSelect, loading }) {
  const { t } = useI18n()
  const sorted = [...(tickers || [])].sort((a, b) => (b.change24hPct || 0) - (a.change24hPct || 0))
  const gainers = sorted.slice(0, limit)
  const losers = sorted.reverse().slice(0, limit)
  return (
    <Flex gap={4} flexWrap="wrap">
      <Glass flex="1 1 320px" p={4}>
        <Heading size="sm" mb={3}>{t('movers.topGainers')}</Heading>
        {loading && gainers.length === 0
          ? Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} height="20px" my={2} borderRadius="full" />
            ))
          : gainers.map((t) => (
              <Row key={`g-${t.symbol}`} t={t} positive symbolType={symbolType} onSelect={onSelect} />
            ))}
      </Glass>
      <Glass flex="1 1 320px" p={4}>
        <Heading size="sm" mb={3}>{t('movers.topLosers')}</Heading>
        {loading && losers.length === 0
          ? Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} height="20px" my={2} borderRadius="full" />
            ))
          : losers.map((t) => (
              <Row key={`l-${t.symbol}`} t={t} symbolType={symbolType} onSelect={onSelect} />
            ))}
      </Glass>
    </Flex>
  )
}

function Row({ t, positive = false, symbolType = 'SPOT', onSelect }) {
  const color = positive ? 'green' : 'red'
  return (
    <HStack justify="space-between" py={1.5}>
      <HStack>
        <TokenLogo base={t.base} />
        <ClickableBadge onClick={() => onSelect && onSelect(t)}>{friendlySymbol(t.symbol, symbolType)}</ClickableBadge>
        <Text color="gray.400">{formatPrice(t.last)}</Text>
      </HStack>
      <Text color={`${color}.400`} fontWeight="semibold">{formatPct(t.change24hPct)}</Text>
    </HStack>
  )
}
