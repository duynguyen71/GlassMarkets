import { Alert, AlertDescription, AlertIcon, Badge, Box, Heading, HStack, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react'
import Glass from '../components/Glass'
import { formatNumber, formatPct, formatUSD } from '../utils/number'
import { friendlySymbol } from '../utils/symbol'
import useVolumeSurprise from '../hooks/useVolumeSurprise'
import { useMemo, useState } from 'react'
import ClickableBadge from '../components/ClickableBadge'
import { useI18n } from '../i18n'
import TokenLogo from '../components/TokenLogo'

export default function SurpriseView({ tickers, active = true, onSelect }) {
  const { t } = useI18n()
  const { rows, loading, error, summary } = useVolumeSurprise({ tickers, lookbackDays: 7, topN: 40, threshold: 2, enabled: active })
  const [query, setQuery] = useState('')
  const thBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.200')
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => !q || r.symbol.toLowerCase().includes(q) || r.base.toLowerCase().includes(q))
  }, [rows, query])

  return (
    <Box>
      <Heading size="md" mb={2}>{t('surprise.title')}</Heading>
      {error && (
        <Alert status="warning" mb={3}>
          <AlertIcon />
          <AlertDescription>Failed to compute volume surprise. {String(error?.message || '')}</AlertDescription>
        </Alert>
      )}

      <Glass p={3} mb={2}>
        <HStack spacing={4}>
          <StatBadge label={t('surprise.tracked')} value={formatNumber(summary.count)} color="gray" />
          <StatBadge label={t('surprise.ge2x')} value={formatNumber(summary.over2)} color="purple" />
          <StatBadge label={t('surprise.ge3x')} value={formatNumber(summary.over3)} color="pink" />
          <StatBadge label={t('surprise.bullish')} value={formatNumber(summary.bullish)} color="green" />
          <StatBadge label={t('surprise.bearish')} value={formatNumber(summary.bearish)} color="red" />
        </HStack>
      </Glass>

      <Input placeholder={t('surprise.search')} value={query} onChange={(e) => setQuery(e.target.value)} mb={2} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} />
      <Glass p={2}>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr bg={thBg} backdropFilter="blur(6px)">
                <Th>{t('table.columns.symbol')}</Th>
                <Th isNumeric>{t('table.columns.last')}</Th>
                <Th isNumeric>{t('table.columns.pct24h')}</Th>
                <Th isNumeric>{t('table.columns.volQuote24h')}</Th>
                <Th isNumeric>{t('surprise.avgVol7d')}</Th>
                <Th isNumeric>{t('surprise.surpriseRatio')}</Th>
                <Th>{t('surprise.signal')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.symbol} _hover={{ bg: rowHover }}>
                  <Td>
                    <HStack>
                      <TokenLogo base={r.base} />
                      <ClickableBadge onClick={() => onSelect && onSelect(r)}>{friendlySymbol(r.symbol, 'SPOT')}</ClickableBadge>
                    </HStack>
                  </Td>
                  <Td isNumeric>{formatNumber(r.last)}</Td>
                  <Td isNumeric color={r.change24hPct >= 0 ? 'green.400' : 'red.400'} fontWeight="semibold">{formatPct(r.change24hPct)}</Td>
                  <Td isNumeric>{formatUSD(r.volCcy24h)}</Td>
                  <Td isNumeric>{r.avgQuoteVol ? formatUSD(r.avgQuoteVol) : '-'}</Td>
                  <Td isNumeric fontWeight="semibold">{r.surpriseRatio ? r.surpriseRatio.toFixed(2) + 'x' : '-'}</Td>
                  <Td>{renderSignal(r, t)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Glass>
    </Box>
  )
}

function StatBadge({ label, value, color = 'gray' }) {
  return (
    <HStack spacing={2}>
      <Badge colorScheme={color} variant="subtle">{label}</Badge>
      <Badge>{value}</Badge>
    </HStack>
  )
}

function renderSignal(r, t) {
  const ratio = r.surpriseRatio || 0
  const ch = r.change24hPct || 0
  if (ratio >= 2 && ch >= 3) return <Badge colorScheme="green">{t('surprise.sBullish')}</Badge>
  if (ratio >= 2 && ch <= -3) return <Badge colorScheme="red">{t('surprise.sBearish')}</Badge>
  if (ratio >= 2) return <Badge colorScheme="purple">{t('surprise.sHighVol')}</Badge>
  return <Badge variant="subtle">{t('surprise.sWatch')}</Badge>
}
