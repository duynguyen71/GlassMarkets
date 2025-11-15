import { Badge, Box, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Grid, GridItem, HStack, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { friendlySymbol } from '../utils/symbol'
import { formatNumber, formatPct, formatUSD, formatPrice } from '../utils/number'
import { fetchCandles as fetchOkxCandles } from '../api/okx'
import { fetchKlinesBinance } from '../api/binance'
import Sparkline from './Sparkline'

export default function CoinDrawer({ isOpen, onClose, ticker, source = 'OKX', symbolType = 'SPOT' }) {
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
          // Binance klines: [openTime, open, high, low, close, volume, closeTime, quoteVolume, ...]
          setSeries(rows.map((r) => Number(r[4])))
        } else {
          rows = await fetchOkxCandles(ticker.symbol, { bar: '5m', limit: 60 })
          if (cancelled) return
          // OKX candles: [ts, o, h, l, c, vol, volCcy, volQuote]
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

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg="rgba(17,25,40,0.65)" backdropFilter="blur(12px) saturate(120%)" borderLeftWidth="1px" borderColor="whiteAlpha.200">
        <DrawerHeader>
          <HStack spacing={3}>
            <Badge>{friendlySymbol(ticker?.symbol, symbolType)}</Badge>
            <Badge variant="subtle" colorScheme={source === 'OKX' ? 'blue' : 'yellow'}>{source}</Badge>
            <Badge variant="subtle" colorScheme={symbolType === 'SPOT' ? 'purple' : 'orange'}>{symbolType}</Badge>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
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
          </Grid>

          <Box>
            <Text fontSize="sm" color="gray.400" mb={2}>5m closes (last 60)</Text>
            {loading ? (
              <Spinner />
            ) : (
              <Sparkline data={series} width={520} height={96} stroke={trendColor.startsWith('green') ? '#22c55e' : '#ef4444'} />
            )}
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
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
