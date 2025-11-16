import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Text, VStack, HStack, Progress, Badge, Spinner, Divider } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Glass from '../components/Glass'
import useSpotTickers from '../hooks/useSpotTickers'
import axios from 'axios'

export default function MarketStatsView({ active }) {
  const { tickers, loading: tickersLoading } = useSpotTickers('okx', 0)
  const [globalData, setGlobalData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!active) return

    const fetchGlobalData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/global', {
          timeout: 5000,
        })
        if (response.data && response.data.data) {
          setGlobalData(response.data.data)
        }
      } catch (err) {
        console.error('Global data fetch error:', err)
        setGlobalData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalData()
  }, [active])

  // Calculate market statistics from tickers
  const stats = {
    totalCoins: tickers?.length || 0,
    gainers: tickers?.filter(t => t.changePercent24h > 0).length || 0,
    losers: tickers?.filter(t => t.changePercent24h < 0).length || 0,
    neutral: tickers?.filter(t => t.changePercent24h === 0).length || 0,
    avgChange: tickers?.length
      ? (tickers.reduce((sum, t) => sum + (t.changePercent24h || 0), 0) / tickers.length).toFixed(2)
      : '0.00',
    topGainer: tickers?.reduce((max, t) => t.changePercent24h > (max?.changePercent24h || -Infinity) ? t : max, null),
    topLoser: tickers?.reduce((min, t) => t.changePercent24h < (min?.changePercent24h || Infinity) ? t : min, null),
    highVolume: tickers?.filter(t => t.quoteVolume > 10000000).length || 0,
    totalVolume: tickers?.reduce((sum, t) => sum + (t.quoteVolume || 0), 0) || 0,
  }

  const formatLargeNumber = (num) => {
    if (!num || isNaN(num)) return '$0'
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const gainersRatio = stats.totalCoins > 0 ? (stats.gainers / stats.totalCoins) * 100 : 0
  const losersRatio = stats.totalCoins > 0 ? (stats.losers / stats.totalCoins) * 100 : 0

  if (tickersLoading || loading) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Market Statistics</Heading>
        <Glass>
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4} color="gray.400">Loading market statistics...</Text>
          </Box>
        </Glass>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Market Statistics</Heading>

      {/* Global Market Stats - Only show if data is available */}
      {globalData && (
        <>
          <Glass mb={4} p={5}>
            <Heading size="md" mb={4}>Global Crypto Market</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Box>
                <Text fontSize="xs" color="gray.400" mb={1}>Market Cap</Text>
                <Text fontSize="xl" fontWeight="bold">{formatLargeNumber(globalData.total_market_cap?.usd)}</Text>
                <HStack spacing={1} mt={1}>
                  <Text fontSize="xs" color={globalData.market_cap_change_percentage_24h_usd > 0 ? 'green.400' : 'red.400'}>
                    {globalData.market_cap_change_percentage_24h_usd > 0 ? '▲' : '▼'} {Math.abs(globalData.market_cap_change_percentage_24h_usd || 0).toFixed(2)}%
                  </Text>
                </HStack>
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.400" mb={1}>24h Volume</Text>
                <Text fontSize="xl" fontWeight="bold">{formatLargeNumber(globalData.total_volume?.usd)}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>Total trading</Text>
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.400" mb={1}>BTC Dominance</Text>
                <Text fontSize="xl" fontWeight="bold">{globalData.market_cap_percentage?.btc?.toFixed(1)}%</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>Market share</Text>
              </Box>

              <Box>
                <Text fontSize="xs" color="gray.400" mb={1}>Active Cryptos</Text>
                <Text fontSize="xl" fontWeight="bold">{globalData.active_cryptocurrencies?.toLocaleString()}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>{globalData.markets?.toLocaleString()} markets</Text>
              </Box>
            </SimpleGrid>
          </Glass>
        </>
      )}

      {/* Spot Market Overview */}
      <Glass mb={4} p={5}>
        <Heading size="md" mb={4}>Spot Market Overview (OKX)</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>Tracked Pairs</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.totalCoins}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>USDT pairs</Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>Total Volume</Text>
            <Text fontSize="2xl" fontWeight="bold">{formatLargeNumber(stats.totalVolume)}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>24h trading</Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>Avg Change</Text>
            <Text fontSize="2xl" fontWeight="bold" color={parseFloat(stats.avgChange) > 0 ? 'green.400' : 'red.400'}>
              {parseFloat(stats.avgChange) > 0 ? '+' : ''}{stats.avgChange}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>24h average</Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.400" mb={1}>High Volume</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.highVolume}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>&gt; $10M volume</Text>
          </Box>
        </SimpleGrid>
      </Glass>

      {/* Market Sentiment */}
      <Glass mb={4} p={5}>
        <Heading size="md" mb={4}>Market Sentiment</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={4}>
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="green.400">{stats.gainers}</Text>
            <Text fontSize="sm" color="gray.400">Gainers</Text>
            <Badge colorScheme="green" fontSize="md" px={3} py={1}>{gainersRatio.toFixed(1)}%</Badge>
          </VStack>

          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="red.400">{stats.losers}</Text>
            <Text fontSize="sm" color="gray.400">Losers</Text>
            <Badge colorScheme="red" fontSize="md" px={3} py={1}>{losersRatio.toFixed(1)}%</Badge>
          </VStack>

          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="gray.400">{stats.neutral}</Text>
            <Text fontSize="sm" color="gray.400">Unchanged</Text>
            <Badge colorScheme="gray" fontSize="md" px={3} py={1}>
              {stats.totalCoins > 0 ? ((stats.neutral / stats.totalCoins) * 100).toFixed(1) : 0}%
            </Badge>
          </VStack>
        </SimpleGrid>

        <Divider borderColor="whiteAlpha.200" my={4} />

        <VStack spacing={3} align="stretch">
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="green.400" fontWeight="semibold">Gainers</Text>
              <Text fontSize="sm" color="gray.400">{gainersRatio.toFixed(1)}%</Text>
            </HStack>
            <Progress value={gainersRatio} colorScheme="green" size="sm" borderRadius="full" />
          </Box>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="red.400" fontWeight="semibold">Losers</Text>
              <Text fontSize="sm" color="gray.400">{losersRatio.toFixed(1)}%</Text>
            </HStack>
            <Progress value={losersRatio} colorScheme="red" size="sm" borderRadius="full" />
          </Box>
        </VStack>
      </Glass>

      {/* Top Performers */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {stats.topGainer && (
          <Glass p={5}>
            <HStack justify="space-between" mb={3}>
              <Heading size="sm" color="green.400">🚀 Top Gainer (24h)</Heading>
            </HStack>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="2xl">{stats.topGainer.symbol?.split('-')[0]}</Text>
                <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                  +{stats.topGainer.changePercent24h?.toFixed(2)}%
                </Badge>
              </HStack>
              <Divider borderColor="whiteAlpha.200" />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">Price</Text>
                <Text fontWeight="semibold">${stats.topGainer.last?.toFixed(8)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">Volume</Text>
                <Text fontWeight="semibold">{formatLargeNumber(stats.topGainer.quoteVolume)}</Text>
              </HStack>
            </VStack>
          </Glass>
        )}

        {stats.topLoser && (
          <Glass p={5}>
            <HStack justify="space-between" mb={3}>
              <Heading size="sm" color="red.400">📉 Top Loser (24h)</Heading>
            </HStack>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="2xl">{stats.topLoser.symbol?.split('-')[0]}</Text>
                <Badge colorScheme="red" fontSize="lg" px={3} py={1}>
                  {stats.topLoser.changePercent24h?.toFixed(2)}%
                </Badge>
              </HStack>
              <Divider borderColor="whiteAlpha.200" />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">Price</Text>
                <Text fontWeight="semibold">${stats.topLoser.last?.toFixed(8)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">Volume</Text>
                <Text fontWeight="semibold">{formatLargeNumber(stats.topLoser.quoteVolume)}</Text>
              </HStack>
            </VStack>
          </Glass>
        )}
      </SimpleGrid>
    </Box>
  )
}
