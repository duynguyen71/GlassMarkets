import { Badge, Box, Button, Grid, GridItem, HStack, Link, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, Progress, Spinner, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { friendlySymbol } from '../utils/symbol'
import { formatNumber, formatPct, formatUSD, formatPrice } from '../utils/number'
import { fetchCandles as fetchOkxCandles } from '../api/okx'
import { fetchKlinesBinance } from '../api/binance'
import Sparkline from './Sparkline'
import TokenLogo from './TokenLogo'

export default function CoinModal({ isOpen, onClose, ticker, source = 'OKX', symbolType = 'SPOT' }) {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isOpen || !ticker?.symbol) return
      setLoading(true)
      try {
        let rows = []
        if (source === 'Binance') {
          rows = await fetchKlinesBinance(ticker.symbol, { interval: '5m', limit: 60 })
          if (cancelled) return
          setSeries(rows.map((r) => Number(r[4])))
        } else {
          rows = await fetchOkxCandles(ticker.symbol, { bar: '5m', limit: 60 })
          if (cancelled) return
          setSeries(rows.map((r) => Number(r[4])).reverse())
        }
      } catch {
        if (!cancelled) setSeries([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isOpen, ticker?.symbol, source])

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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'xl' }}>
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent
        bg="rgba(17,25,40,0.65)"
        backdropFilter="blur(12px) saturate(120%)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
      >
        <ModalHeader>
          <HStack spacing={3}>
            <TokenLogo base={ticker?.base} />
            <Badge>{friendlySymbol(ticker?.symbol, symbolType)}</Badge>
            <Badge variant="subtle" colorScheme={source === 'OKX' ? 'blue' : 'yellow'}>{source}</Badge>
            <Badge variant="subtle" colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'}>{symbolType}</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={4}>
            <GridItem>
              <StatLine label="Last" value={formatPrice(ticker?.last)} />
            </GridItem>
            <GridItem>
              <StatLine label="24h Change" value={formatPct(ticker?.change24hPct)} color={trendColor} />
            </GridItem>
            <GridItem>
              <StatLine label="24h High" value={formatPrice(ticker?.high24h)} />
            </GridItem>
            <GridItem>
              <StatLine label="24h Low" value={formatPrice(ticker?.low24h)} />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <StatLine label="24h Volume (quote)" value={formatUSD(ticker?.volCcy24h)} />
            </GridItem>
            <GridItem>
              <StatLine label="Open (24h)" value={formatPrice(open24h)} />
            </GridItem>
            <GridItem>
              <StatLine label="Change (abs)" value={changeAbs != null ? (changeAbs >= 0 ? `+${formatPrice(changeAbs)}` : formatPrice(changeAbs)) : '-'} color={trendColor} />
            </GridItem>
            <GridItem>
              <StatLine label="VWAP (24h)" value={vwap24h != null ? formatPrice(vwap24h) : '-'} />
            </GridItem>
            <GridItem>
              <StatLine label="Volume (base)" value={Number.isFinite(volBase24h) ? formatNumber(volBase24h, { notation: 'compact', maximumFractionDigits: 2 }) : '-'} />
            </GridItem>
          </Grid>

          <Box overflowX="hidden">
            <Text fontSize="sm" color="gray.400" mb={2}>5m closes (last 60)</Text>
            {loading ? (
              <Spinner />
            ) : (
              <Sparkline data={series} width="100%" height={120} stroke={trendColor.startsWith('green') ? '#22c55e' : '#ef4444'} />
            )}
          </Box>

          <Box mt={4}>
            <Text fontSize="sm" color="gray.400" mb={1}>24h Range</Text>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm">{formatPrice(low24h)}</Text>
              <Text fontSize="sm">{formatPrice(high24h)}</Text>
            </HStack>
            <Progress value={Number.isFinite(posPct) ? posPct : 0} height="6px" borderRadius="full" colorScheme={(ticker?.change24hPct || 0) >= 0 ? 'green' : 'red'} />
            <Text mt={1} fontSize="xs" color="gray.400">{rangePct != null ? `${rangePct.toFixed(2)}% range` : ''}</Text>
          </Box>

          <HStack mt={4} spacing={4} wrap="wrap">
            {tradeUrl && (
              <Link href={tradeUrl} isExternal color="blue.300">View on {source} <ExternalLinkIcon mx="2px" /></Link>
            )}
            {ticker?.ts ? (
              <Text fontSize="sm" color="gray.400">Updated: {new Date(ticker.ts).toLocaleTimeString()}</Text>
            ) : null}
          </HStack>

          <Button mt={4} w="100%" display={{ base: 'block', md: 'none' }} onClick={onClose} borderRadius="full" variant="outline">
            Close
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
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
