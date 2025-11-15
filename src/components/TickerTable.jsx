import { Badge, Box, Button, HStack, IconButton, Input, Select, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Text, useColorModeValue } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, TriangleUpIcon, TriangleDownIcon, MinusIcon } from '@chakra-ui/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearch } from '../state/search'
import useLocalStorage from '../hooks/useLocalStorage'
import { formatNumber, formatPct, formatPrice } from '../utils/number'
import Glass from './Glass'
import { friendlySymbol } from '../utils/symbol'
import ClickableBadge from './ClickableBadge'
import TokenLogo from './TokenLogo'
import { useI18n } from '../i18n'

export default function TickerTable({ tickers, symbolType = 'SPOT', typeLabel = 'Spot', defaultPageSize = 25, onSelect, loading }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'volCcy24h', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useLocalStorage(`pref:pageSize:${symbolType}`, defaultPageSize)
  const { recordSearch } = useSearch()
  const lastPriceRef = useRef(new Map())
  const timersRef = useRef(new Map())
  const [flash, setFlash] = useState({}) // { [symbol]: 'up'|'down' }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = (tickers || []).filter((row) => !q || row.symbol.toLowerCase().includes(q) || row.base.toLowerCase().includes(q))
    list.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      const av = a[sort.key] ?? 0
      const bv = b[sort.key] ?? 0
      if (typeof av === 'string') return dir * String(av).localeCompare(String(bv))
      return dir * (Number(av) - Number(bv))
    })
    return list
  }, [tickers, query, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filtered.length)
  const paginated = filtered.slice(startIndex, endIndex)

  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const sortIcon = (key) => sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : ''

  // reset to first page when filters change
  useEffect(() => { setPage(1) }, [query, sort, pageSize])

  // page size persisted via useLocalStorage

  const thBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.200')
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  // Detect price changes and flash background briefly
  useEffect(() => {
    const map = lastPriceRef.current
    const timers = timersRef.current
    const next = {}
    for (const row of tickers || []) {
      const curr = Number(row.last)
      if (!Number.isFinite(curr)) continue
      const prev = map.get(row.symbol)
      if (prev != null && prev !== curr) {
        next[row.symbol] = curr > prev ? 'up' : 'down'
        const existing = timers.get(row.symbol)
        if (existing) clearTimeout(existing)
        const id = setTimeout(() => {
          setFlash((f) => {
            const copy = { ...f }
            delete copy[row.symbol]
            return copy
          })
          timers.delete(row.symbol)
        }, 700)
        timers.set(row.symbol, id)
      }
      map.set(row.symbol, curr)
    }
    if (Object.keys(next).length) setFlash((f) => ({ ...f, ...next }))
  }, [tickers])

  useEffect(() => () => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current.clear()
  }, [])

  return (
    <Box>
      <Input placeholder={t('table.searchSpot')} value={query} onChange={(e) => { setQuery(e.target.value); recordSearch(e.target.value) }} mb={2} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} />
      <Glass p={2}>
        <TableContainer overflowX="auto">
          <Table size="sm" variant="simple" minW="720px">
            <Thead>
              <Tr backdropFilter="blur(6px)" sx={{ WebkitBackdropFilter: 'blur(6px)' }}>
                <Th bg={thBg} borderTopLeftRadius="lg" cursor="pointer" onClick={() => toggle('symbol')}>{t('table.columns.symbol')} {sortIcon('symbol')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('last')}>{t('table.columns.last')} {sortIcon('last')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('change24hPct')}>{t('table.columns.pct24h')} {sortIcon('change24hPct')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('high24h')}>{t('table.columns.high')} {sortIcon('high24h')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('low24h')}>{t('table.columns.low')} {sortIcon('low24h')}</Th>
                <Th bg={thBg} isNumeric cursor="pointer" onClick={() => toggle('volCcy24h')}>{t('table.columns.volQuote24h')} {sortIcon('volCcy24h')}</Th>
                <Th bg={thBg} borderTopRightRadius="lg">{t('table.columns.trend')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(loading && filtered.length === 0) ? (
                Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                  <Tr key={`sk-${i}`}>
                    <Td colSpan={7}>
                      <Box py={2}><Box h="18px" bg="whiteAlpha.200" borderRadius="full" /></Box>
                    </Td>
                  </Tr>
                ))
              ) : paginated.map((row) => (
                <Tr key={row.symbol} _hover={{ bg: rowHover }}>
                  <Td>
                    <HStack spacing={2}>
                      <TokenLogo base={row.base} />
                      <ClickableBadge onClick={() => onSelect && onSelect(row)}>{friendlySymbol(row.symbol, symbolType)}</ClickableBadge>
                      <Badge colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'} variant="subtle">{symbolType === 'SPOT' ? t('table.typeSpot') : t('table.typeFutures')}</Badge>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <Box as="span" px={1} py={0.5} borderRadius="md" bg={flash[row.symbol] === 'up' ? 'green.500' : flash[row.symbol] === 'down' ? 'red.500' : 'transparent'} opacity={flash[row.symbol] ? 0.25 : 1} transition="background-color 0.3s ease, opacity 0.3s ease">
                      {formatPrice(row.last)}
                    </Box>
                  </Td>
                  <Td isNumeric color={row.change24hPct >= 0 ? 'green.400' : 'red.400'} fontWeight="semibold">{formatPct(row.change24hPct)}</Td>
                  <Td isNumeric>{formatPrice(row.high24h)}</Td>
                  <Td isNumeric>{formatPrice(row.low24h)}</Td>
                  <Td isNumeric>{formatNumber(row.volCcy24h, { notation: 'compact', maximumFractionDigits: 2 })}</Td>
                  <Td>{sparkFrom(row)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Glass>

      <HStack justify="space-between" mt={2}>
        <Text fontSize="sm" color="gray.400">
          Showing {filtered.length === 0 ? 0 : startIndex + 1}–{endIndex} of {filtered.length}
        </Text>
        <HStack>
          <Select size="sm" value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }} width="auto">
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </Select>
          <HStack>
            <IconButton aria-label="prev page" size="sm" icon={<ChevronLeftIcon />} isDisabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
            <Text fontSize="sm">{currentPage} / {pageCount}</Text>
            <IconButton aria-label="next page" size="sm" icon={<ChevronRightIcon />} isDisabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} />
          </HStack>
        </HStack>
      </HStack>
    </Box>
  )
}

function sparkFrom(t) {
  const ch = Number(t.change24hPct || 0)
  if (!Number.isFinite(ch)) return '-'
  if (ch > 0.2) return <TriangleUpIcon color="green.400" boxSize={4} />
  if (ch < -0.2) return <TriangleDownIcon color="red.400" boxSize={4} />
  return <MinusIcon color="gray.400" boxSize={3} />
}
