import { Badge, Box, Button, ButtonGroup, Divider, Flex, Grid, GridItem, Heading, HStack, Link, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, Progress, Spinner, Stack, Text, VStack } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { friendlySymbol } from '../utils/symbol'
import { formatNumber, formatPct, formatUSD, formatPrice } from '../utils/number'
import { fetchCandles as fetchOkxCandles } from '../api/okx'
import { fetchKlinesBinance } from '../api/binance'
import Sparkline from './Sparkline'
import TokenLogo from './TokenLogo'
import Glass from './Glass'

const TIMEFRAME_OPTIONS = [
  { label: '5m', interval: '5m', bar: '5m', limit: 60 },
  { label: '15m', interval: '15m', bar: '15m', limit: 60 },
  { label: '1h', interval: '1h', bar: '1H', limit: 60 },
  { label: '4h', interval: '4h', bar: '4H', limit: 60 },
  { label: '6h', interval: '6h', bar: '6H', limit: 60 },
  { label: '12h', interval: '12h', bar: '12H', limit: 60 },
]

export default function CoinModal({ isOpen, onClose, ticker, source = 'OKX', symbolType = 'SPOT' }) {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState('1h')

  useEffect(() => {
    if (!isOpen || !ticker?.symbol) {
      setSeries([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        const tf = TIMEFRAME_OPTIONS.find(t => t.label === timeframe) || TIMEFRAME_OPTIONS[2]
        let rows = []
        if (source === 'Binance') {
          rows = await fetchKlinesBinance(ticker.symbol, { interval: tf.interval, limit: tf.limit })
          if (cancelled) return
          setSeries(rows.map((r) => Number(r[4])))
        } else {
          rows = await fetchOkxCandles(ticker.symbol, { bar: tf.bar, limit: tf.limit })
          if (cancelled) return
          setSeries(rows.map((r) => Number(r[4])).reverse())
        }
      } catch {
        if (!cancelled) setSeries([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Delay the data fetch slightly so modal renders first
    const timer = setTimeout(load, 50)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isOpen, ticker?.symbol, source, timeframe])

  const trendColor = (ticker?.change24hPct || 0) >= 0 ? 'green.400' : 'red.400'
  const last = Number(ticker?.last)
  const open24h = Number(ticker?.open24h)
  const high24h = Number(ticker?.high24h)
  const low24h = Number(ticker?.low24h)
  const volBase24h = Number(ticker?.vol24h)
  const volQuote24h = Number(ticker?.volCcy24h)
  const changeAbs = (Number.isFinite(last) && Number.isFinite(open24h)) ? (last - open24h) : null
  const vwap24h = (volBase24h > 0 && volQuote24h > 0) ? (volQuote24h / volBase24h) : null
  const rangePct = (Number.isFinite(high24h) && Number.isFinite(low24h) && high24h > low24h) ? ((high24h - low24h) / low24h) * 100 : null
  const posPct = (Number.isFinite(high24h) && Number.isFinite(low24h) && Number.isFinite(last) && high24h > low24h) ? ((last - low24h) / (high24h - low24h)) * 100 : null

  const tradeUrl = buildTradeUrl(source, symbolType, ticker)

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: '2xl' }} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.800" zIndex={1400} />
      <ModalContent
        bg="rgba(17,25,40,0.75)"
        backdropFilter="blur(16px) saturate(130%)"
        borderWidth="1px"
        borderColor="whiteAlpha.300"
        borderRadius={{ base: '0', md: '3xl' }}
        zIndex={1401}
        maxH="100vh"
        h={{ base: '100vh', md: 'auto' }}
        my={{ base: 0, md: 4 }}
        mx={{ base: 0, md: 4 }}
        overflow="hidden"
      >
        <ModalHeader py={6} px={6}>
          <VStack align="stretch" spacing={3}>
            <HStack spacing={3}>
              <TokenLogo base={ticker?.base} boxSize={10} />
              <VStack align="start" spacing={1} flex="1">
                <Heading size={{ base: 'sm', md: 'md' }}>{friendlySymbol(ticker?.symbol, symbolType)}</Heading>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge variant="subtle" colorScheme={source === 'OKX' ? 'blue' : 'yellow'} fontSize="xs">
                    {source}
                  </Badge>
                  <Badge variant="subtle" colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'} fontSize="xs">
                    {symbolType}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>

            {/* Price Header */}
            <Glass p={4} bg="whiteAlpha.50">
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between" align="baseline">
                  <Text fontSize="3xl" fontWeight="bold">{formatPrice(ticker?.last)}</Text>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={(ticker?.change24hPct || 0) >= 0 ? 'green' : 'red'}
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {formatPct(ticker?.change24hPct)}
                    </Badge>
                  </HStack>
                </HStack>
                {changeAbs != null && (
                  <Text fontSize="sm" color={(changeAbs || 0) >= 0 ? 'green.400' : 'red.400'}>
                    {changeAbs >= 0 ? '+' : ''}{formatPrice(changeAbs)} (24h)
                  </Text>
                )}
              </VStack>
            </Glass>
          </VStack>
        </ModalHeader>
        <ModalCloseButton top={6} right={6} size="lg" borderRadius="full" />
        <ModalBody px={6} pb={6} overflowY="auto" overflowX="hidden">
          <VStack align="stretch" spacing={6}>

            {/* Price Chart */}
            <Box>
              <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.400">
                  Price Chart
                </Text>
                <ButtonGroup isAttached size="xs" variant="outline">
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <Button
                      key={tf.label}
                      onClick={() => setTimeframe(tf.label)}
                      variant={timeframe === tf.label ? 'solid' : 'outline'}
                      colorScheme={timeframe === tf.label ? 'blue' : 'gray'}
                    >
                      {tf.label.toUpperCase()}
                    </Button>
                  ))}
                </ButtonGroup>
              </Flex>
              <Glass p={4}>
                {loading ? (
                  <Flex justify="center" align="center" h={140}>
                    <Spinner color={trendColor} />
                  </Flex>
                ) : series.length > 0 ? (
                  <Sparkline
                    data={series}
                    width="100%"
                    height={140}
                    stroke={trendColor.startsWith('green') ? '#22c55e' : '#ef4444'}
                  />
                ) : (
                  <Flex justify="center" align="center" h={140}>
                    <Text color="gray.500" fontSize="sm">No chart data available</Text>
                  </Flex>
                )}
              </Glass>
            </Box>

            {/* 24h Range */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400" mb={3}>
                24h Range
              </Text>
              <Glass p={4}>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.500">Low</Text>
                      <Text fontSize="lg" fontWeight="semibold">{formatPrice(low24h)}</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontSize="xs" color="gray.500">Current</Text>
                      <Text fontSize="lg" fontWeight="semibold">{formatPrice(last)}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="xs" color="gray.500">High</Text>
                      <Text fontSize="lg" fontWeight="semibold">{formatPrice(high24h)}</Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={Number.isFinite(posPct) ? posPct : 0}
                    height="8px"
                    borderRadius="full"
                    colorScheme={(ticker?.change24hPct || 0) >= 0 ? 'green' : 'red'}
                  />
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    {rangePct != null ? `${rangePct.toFixed(2)}% range` : ''}
                  </Text>
                </VStack>
              </Glass>
            </Box>

            {/* Market Data */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400" mb={3}>
                Market Data
              </Text>
              <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3}>
                <StatCard label="24h Volume" value={formatUSD(ticker?.volCcy24h)} />
                <StatCard label="Volume (Base)" value={Number.isFinite(volBase24h) ? formatNumber(volBase24h, { notation: 'compact', maximumFractionDigits: 2 }) : '-'} />
                <StatCard label="Open (24h)" value={formatPrice(open24h)} />
                <StatCard label="VWAP (24h)" value={vwap24h != null ? formatPrice(vwap24h) : '-'} />
              </Grid>
            </Box>

            <Divider borderColor="whiteAlpha.200" />

            {/* External Links */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400" mb={3}>
                Quick Links
              </Text>
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2}>
                {tradeUrl && (
                  <Link href={tradeUrl} isExternal>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      rightIcon={<ExternalLinkIcon />}
                      colorScheme="blue"
                      w="100%"
                      fontSize={{ base: 'xs', md: 'sm' }}
                    >
                      {source}
                    </Button>
                  </Link>
                )}
                <Link href={buildTradingViewUrl(ticker)} isExternal>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    rightIcon={<ExternalLinkIcon />}
                    w="100%"
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    TradingView
                  </Button>
                </Link>
                <Link href={buildDexScreenerUrl(ticker)} isExternal>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    rightIcon={<ExternalLinkIcon />}
                    w="100%"
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    DEXScreener
                  </Button>
                </Link>
                <Link href={buildCoinGeckoUrl(ticker)} isExternal>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    rightIcon={<ExternalLinkIcon />}
                    w="100%"
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    CoinGecko
                  </Button>
                </Link>
              </Grid>
            </Box>

            {ticker?.ts && (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Last updated: {new Date(ticker.ts).toLocaleString()}
              </Text>
            )}

            {/* Mobile Close Button */}
            <Button
              display={{ base: 'block', md: 'none' }}
              onClick={onClose}
              borderRadius="full"
              colorScheme="blue"
              size="lg"
              w="100%"
            >
              Close
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function StatCard({ label, value }) {
  return (
    <Glass p={4} hoverLift>
      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" color="gray.500">{label}</Text>
        <Text fontSize="lg" fontWeight="semibold">{value}</Text>
      </VStack>
    </Glass>
  )
}

function StatLine({ label, value, color }) {
  return (
    <HStack justify="space-between">
      <Text color="gray.400">{label}</Text>
      <Text fontWeight="semibold" color={color}>{value}</Text>
    </HStack>
  )
}

function buildTradeUrl(source, symbolType, ticker) {
  if (!ticker?.symbol) return null
  const base = ticker.symbol.split('-')[0]
  const quote = ticker.symbol.split('-')[1]
  if (source === 'Binance') {
    if (symbolType === 'SPOT') return `https://www.binance.com/en/trade/${base}_${quote}?type=spot`
    return `https://www.binance.com/en/futures/${base}${quote}`
  } else {
    if (symbolType === 'SPOT') return `https://www.okx.com/trade-spot/${base.toLowerCase()}-${quote.toLowerCase()}`
    return `https://www.okx.com/trade-futures/${ticker.symbol.toLowerCase()}`
  }
}

function buildTradingViewUrl(ticker) {
  if (!ticker?.symbol) return '#'
  const base = ticker.symbol.split('-')[0]
  const quote = ticker.symbol.split('-')[1] || 'USDT'
  return `https://www.tradingview.com/chart/?symbol=BINANCE:${base}${quote}`
}

function buildDexScreenerUrl(ticker) {
  if (!ticker?.base) return '#'
  const base = ticker.base
  return `https://dexscreener.com/search?q=${base}`
}

function buildCoinGeckoUrl(ticker) {
  if (!ticker?.base) return '#'
  const base = ticker.base.toLowerCase()
  return `https://www.coingecko.com/en/coins/${base}`
}
