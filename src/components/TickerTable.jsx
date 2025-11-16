import { Badge, Box, HStack, IconButton, Input, Select, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Text, useBreakpointValue, useColorModeValue, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, TriangleUpIcon, TriangleDownIcon, MinusIcon, ArrowUpDownIcon } from '@chakra-ui/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearch } from '../state/search'
import useLocalStorage from '../hooks/useLocalStorage'
import { formatNumber, formatPct, formatPrice } from '../utils/number'
import Glass from './Glass'
import { friendlySymbol } from '../utils/symbol'
import ClickableBadge from './ClickableBadge'
import TokenLogo from './TokenLogo'
import { useI18n } from '../i18n'
import { useSource } from '../state/source'
import { useChangeWindow } from '../state/changeWindow'
import useWindowChange from '../hooks/useWindowChange'
import { useFavorites } from '../state/favorites'

export default function TickerTable({ tickers, symbolType = 'SPOT', typeLabel, defaultPageSize = 25, onSelect, loading }) {
  const { t } = useI18n()
  const { source } = useSource()
  const { window: changeWin } = useChangeWindow()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'volCcy24h', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useLocalStorage(`pref:pageSize:${symbolType}`, defaultPageSize)
  const { recordSearch } = useSearch()
  const lastPriceRef = useRef(new Map())
  const timersRef = useRef(new Map())
  const [flash, setFlash] = useState({}) // { [symbol]: 'up'|'down' }

  const effectiveWin = symbolType === 'SPOT' ? changeWin : '24h'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = (tickers || []).filter((row) => !q || row.symbol.toLowerCase().includes(q) || row.base.toLowerCase().includes(q))
    list.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      let av = a[sort.key] ?? 0
      let bv = b[sort.key] ?? 0
      if (sort.key === 'change24hPct' && effectiveWin !== '24h') {
        av = a._winPct ?? av
        bv = b._winPct ?? bv
      }
      if (typeof av === 'string') return dir * String(av).localeCompare(String(bv))
      return dir * (Number(av) - Number(bv))
    })
    return list
  }, [tickers, query, sort, effectiveWin])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filtered.length)
  const paginated = filtered.slice(startIndex, endIndex)

  const winMap = useWindowChange(filtered, source, effectiveWin)
  // merge window pct into rows for rendering/sorting
  const rows = useMemo(() => {
    if (effectiveWin === '24h') return paginated
    return paginated.map((r) => ({ ...r, _winPct: winMap[r.symbol] }))
  }, [paginated, winMap, effectiveWin])

  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const sortIcon = (key) => sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : ''

  // reset to first page when filters change
  useEffect(() => { setPage(1) }, [query, sort, pageSize])

  // page size persisted via useLocalStorage

  const headDivider = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const pctLabel = effectiveWin === '24h' ? t('table.columns.pct24h') : `${effectiveWin.toUpperCase()} %`
  const typeDisplay = typeLabel || (symbolType === 'SPOT' ? t('table.typeSpot') : t('table.typeFutures'))
  const isMobile = useBreakpointValue({ base: true, md: false })
  const showSkeleton = loading && filtered.length === 0
  const showFavoriteColumn = symbolType === 'SPOT'
  const columnCount = 7 + (showFavoriteColumn ? 1 : 0)
  const labels = {
    last: t('table.columns.last'),
    pct: pctLabel,
    high: t('table.columns.high'),
    low: t('table.columns.low'),
    vol: t('table.columns.volQuote24h'),
    trend: t('table.columns.trend'),
    favorite: t('table.favorite'),
  }

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
      {isMobile ? (
        showSkeleton ? (
          <VStack spacing={3} w="100%">
            {Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <Glass key={`msk-${i}`} p={3} w="100%">
                <Box h="64px" bg="whiteAlpha.100" borderRadius="xl" />
              </Glass>
            ))}
          </VStack>
        ) : filtered.length === 0 ? (
          <Glass p={4}>
            <Text fontSize="sm" color="gray.400">{t('table.noResults')}</Text>
          </Glass>
        ) : (
          <VStack spacing={3} w="100%">
            {rows.map((row) => (
              <MobileTickerCard
                key={row.symbol}
                row={row}
                symbolType={symbolType}
                onSelect={onSelect}
                effectiveWin={effectiveWin}
                labels={labels}
                typeDisplay={typeDisplay}
                showFavorite={showFavoriteColumn}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
              />
            ))}
          </VStack>
        )
      ) : (
        <Glass p={2}>
          <TableContainer overflowX="auto">
          <Table size="sm" variant="simple" minW={{ base: '100%', md: '720px' }}>
            <Thead position="sticky" top={0} zIndex={1}>
              <Tr borderBottomWidth="1px" borderColor={headDivider} role="group">
                {showFavoriteColumn && (
                  <Th px={{ base: 1, md: 2 }} textAlign="center" fontSize="xs">
                    {labels.favorite}
                  </Th>
                )}
                <HeaderTh label={t('table.columns.symbol')} isFirst onClick={() => toggle('symbol')} active={sort.key==='symbol'} dir={sort.dir} />
                  <HeaderTh label={t('table.columns.last')} isNumeric onClick={() => toggle('last')} active={sort.key==='last'} dir={sort.dir} />
                  <HeaderTh label={pctLabel} isNumeric onClick={() => toggle('change24hPct')} active={sort.key==='change24hPct'} dir={sort.dir} />
                  <HeaderTh label={t('table.columns.high')} isNumeric onClick={() => toggle('high24h')} active={sort.key==='high24h'} dir={sort.dir} />
                  <HeaderTh label={t('table.columns.low')} isNumeric onClick={() => toggle('low24h')} active={sort.key==='low24h'} dir={sort.dir} />
                  <HeaderTh label={t('table.columns.volQuote24h')} isNumeric onClick={() => toggle('volCcy24h')} active={sort.key==='volCcy24h'} dir={sort.dir} isLast />
                  <Th>{t('table.columns.trend')}</Th>
                </Tr>
              </Thead>
              <Tbody>
              {showSkeleton ? (
                Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                  <Tr key={`sk-${i}`}>
                    <Td colSpan={columnCount}>
                      <Box py={2}><Box h="18px" bg="whiteAlpha.200" borderRadius="full" /></Box>
                    </Td>
                  </Tr>
                ))
              ) : rows.length === 0 ? (
                <Tr>
                  <Td colSpan={columnCount}>
                    <Text fontSize="sm" color="gray.400">{t('table.noResults')}</Text>
                  </Td>
                </Tr>
              ) : rows.map((row) => {
                const favoriteActive = showFavoriteColumn && isFavorite(row.symbol)
                return (
                  <Tr key={row.symbol} _hover={{ bg: rowHover }}>
                    {showFavoriteColumn && (
                      <Td px={{ base: 1, md: 2 }} textAlign="center">
                        <IconButton
                          size="sm"
                          aria-label={labels.favorite}
                          variant="ghost"
                          icon={<StarIcon />}
                          color={favoriteActive ? 'yellow.400' : 'gray.400'}
                          onClick={() => toggleFavorite(row.symbol)}
                        />
                      </Td>
                    )}
                    <Td>
                      <HStack spacing={2}>
                        <TokenLogo base={row.base} />
                        <ClickableBadge onClick={() => onSelect && onSelect(row)}>{friendlySymbol(row.symbol, symbolType)}</ClickableBadge>
                        <Badge colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'} variant="subtle">{typeDisplay}</Badge>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Box as="span" px={1} py={0.5} borderRadius="md" bg={flash[row.symbol] === 'up' ? 'green.500' : flash[row.symbol] === 'down' ? 'red.500' : 'transparent'} opacity={flash[row.symbol] ? 0.25 : 1} transition="background-color 0.3s ease, opacity 0.3s ease">
                        {formatPrice(row.last)}
                      </Box>
                    </Td>
                    <Td isNumeric color={(effectiveWin === '24h' ? row.change24hPct : row._winPct) >= 0 ? 'green.400' : 'red.400'} fontWeight="semibold">
                      {effectiveWin !== '24h' && row._winPct == null ? (
                        <Text as="span" color="gray.500" fontSize="xs">...</Text>
                      ) : (
                        formatPct((effectiveWin === '24h' ? row.change24hPct : row._winPct) ?? 0)
                      )}
                    </Td>
                    <Td isNumeric>{formatPrice(row.high24h)}</Td>
                    <Td isNumeric>{formatPrice(row.low24h)}</Td>
                    <Td isNumeric>{formatNumber(row.volCcy24h, { notation: 'compact', maximumFractionDigits: 2 })}</Td>
                    <Td>{sparkFrom(row)}</Td>
                  </Tr>
                )
              })}
              </Tbody>
            </Table>
          </TableContainer>
        </Glass>
      )}

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

function MobileTickerCard({ row, symbolType, onSelect, effectiveWin, labels, typeDisplay, showFavorite, toggleFavorite, isFavorite }) {
  const change = effectiveWin === '24h' ? row.change24hPct : row._winPct
  const isLoading = effectiveWin !== '24h' && change == null
  const trendColor = (change || 0) >= 0 ? 'green.300' : 'red.300'
  const favoriteActive = showFavorite && isFavorite(row.symbol)
  return (
    <Glass p={3} hoverLift w="100%">
      <HStack justify="space-between" align="flex-start">
        <HStack spacing={3} align="flex-start">
          <TokenLogo base={row.base} />
          <Box>
            <HStack spacing={2}>
              <ClickableBadge onClick={() => onSelect && onSelect(row)}>{friendlySymbol(row.symbol, symbolType)}</ClickableBadge>
              <Badge colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'} variant="subtle">
                {typeDisplay}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500">{row.symbol}</Text>
          </Box>
        </HStack>
        <HStack align="flex-start" spacing={2}>
          {showFavorite && (
            <IconButton
              icon={<StarIcon />}
              aria-label={labels.favorite}
              size="sm"
              variant="ghost"
              color={favoriteActive ? 'yellow.400' : 'gray.400'}
              borderRadius="full"
              onClick={() => toggleFavorite(row.symbol)}
            />
          )}
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.400">{labels.last}</Text>
            <Text fontWeight="bold">{formatPrice(row.last)}</Text>
          </Box>
        </HStack>
      </HStack>
      <VStack align="stretch" spacing={1.5} mt={3}>
        <RowStat label={labels.pct} value={isLoading ? '...' : formatPct(change ?? 0)} color={trendColor} />
        <RowStat label={labels.high} value={formatPrice(row.high24h)} />
        <RowStat label={labels.low} value={formatPrice(row.low24h)} />
        <RowStat label={labels.vol} value={formatNumber(row.volCcy24h, { notation: 'compact', maximumFractionDigits: 2 })} />
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.400">{labels.trend}</Text>
          <Box>{sparkFrom(row)}</Box>
        </HStack>
      </VStack>
    </Glass>
  )
}

function RowStat({ label, value, color }) {
  return (
    <HStack justify="space-between">
      <Text fontSize="sm" color="gray.400">{label}</Text>
      <Text fontWeight="semibold" color={color}>{value}</Text>
    </HStack>
  )
}

function HeaderTh({ label, isNumeric, isFirst, isLast, onClick, active, dir }) {
  const labelColor = useColorModeValue('gray.600', 'gray.300')
  const accent = useColorModeValue('blue.400', 'blue.300')
  const divider = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  return (
    <Th
      bg="transparent"
      borderTopLeftRadius={isFirst ? 'md' : undefined}
      borderTopRightRadius={isLast ? 'md' : undefined}
      isNumeric={isNumeric}
      cursor="pointer"
      onClick={onClick}
      borderBottomWidth="2px"
      borderColor={active ? accent : 'transparent'}
      px={{ base: 2, md: 3 }}
      py={{ base: 1.5, md: 2 }}
    >
      <HStack spacing={1} justify={isNumeric ? 'flex-end' : 'flex-start'}>
        <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color={labelColor}>
          {label}
        </Text>
        {active ? (
          dir === 'asc' ? <TriangleUpIcon color={accent} boxSize={3} /> : <TriangleDownIcon color={accent} boxSize={3} />
        ) : (
          <ArrowUpDownIcon color={useColorModeValue('gray.400', 'gray.500')} boxSize={3} opacity={0} transition="opacity 0.15s ease" _groupHover={{ opacity: 1 }} />
        )}
      </HStack>
    </Th>
  )
}

function sparkFrom(t) {
  const ch = Number(t.change24hPct || 0)
  if (!Number.isFinite(ch)) return '-'
  if (ch > 0.2) return <TriangleUpIcon color="green.400" boxSize={4} />
  if (ch < -0.2) return <TriangleDownIcon color="red.400" boxSize={4} />
  return <MinusIcon color="gray.400" boxSize={3} />
}
