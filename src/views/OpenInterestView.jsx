import { Alert, AlertDescription, AlertIcon, Badge, Box, Heading, HStack, Input, Skeleton, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react'
import Glass from '../components/Glass'
import useOkxOpenInterest from '../hooks/useOkxOpenInterest'
import { useMemo, useState } from 'react'
import { formatNumber, formatUSD } from '../utils/number'
import { friendlySymbol } from '../utils/symbol'
import TokenLogo from '../components/TokenLogo'
import { useI18n } from '../i18n'

export default function OpenInterestView({ active = true }) {
  const { t } = useI18n()
  const { items, loading, error, totalOiCcy } = useOkxOpenInterest({ limit: 25, enabled: active })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'oiCcy', dir: 'desc' })

  const thBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.200')
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (items || []).filter((x) => !q || x.instId.toLowerCase().includes(q))
    list.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      const av = a[sort.key] ?? 0
      const bv = b[sort.key] ?? 0
      if (typeof av === 'string') return dir * String(av).localeCompare(String(bv))
      return dir * (Number(av) - Number(bv))
    })
    return list
  }, [items, query, sort])

  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  const sortIcon = (key) => sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : ''

  return (
    <Box>
      <Heading size="md" mb={2}>{t('oi.title')}</Heading>
      {error && (
        <Alert status="warning" mb={3}>
          <AlertIcon />
          <AlertDescription>Failed to load open interest. {String(error?.message || '')}</AlertDescription>
        </Alert>
      )}
      <Glass p={3} mb={2}>
        <Skeleton isLoaded={!loading} borderRadius="lg">
          <Heading size="sm">{t('oi.totalOi')} {formatUSD(totalOiCcy)}</Heading>
        </Skeleton>
      </Glass>

      <Input placeholder={t('oi.search')} value={query} onChange={(e) => setQuery(e.target.value)} mb={2} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} />
      <Glass p={2}>
        <TableContainer overflowX="auto">
          <Table size="sm" minW="680px">
            <Thead>
              <Tr backdropFilter="blur(6px)">
                <Th bg={thBg} borderTopLeftRadius="lg" cursor="pointer" onClick={() => toggle('instId')}>{t('table.columns.symbol')} {sortIcon('instId')}</Th>
                <Th bg={thBg}>{t('table.columns.type')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('oi')}>{t('table.columns.oiContracts')} {sortIcon('oi')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('oiCcy')}>{t('table.columns.oiCcy')} {sortIcon('oiCcy')}</Th>
                <Th bg={thBg} borderTopRightRadius="lg" isNumeric>{t('table.columns.updated')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(loading && filtered.length === 0) ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Tr key={`sk-oi-${i}`}>
                    <Td colSpan={5}><Box py={2}><Box h="18px" bg="whiteAlpha.200" borderRadius="full" /></Box></Td>
                  </Tr>
                ))
              ) : filtered.map((x) => (
                <Tr key={x.instId} _hover={{ bg: rowHover }}>
                  <Td>
                    <HStack>
                      <TokenLogo base={x.base} />
                      <Badge>{friendlySymbol(x.instId, x.instType)}</Badge>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={x.instType === 'SWAP' ? 'orange' : 'purple'} variant="subtle">
                      {x.instType === 'SWAP' ? t('table.typePerp') : (x.instType || t('table.typeFutures'))}
                    </Badge>
                  </Td>
                  <Td isNumeric>{formatNumber(x.oi)}</Td>
                  <Td isNumeric>{formatUSD(x.oiCcy)}</Td>
                  <Td isNumeric>{new Date(x.ts).toLocaleTimeString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Glass>
    </Box>
  )
}
