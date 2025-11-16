import { Box, Heading, SimpleGrid, Spinner, Text, VStack, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import Glass from '../components/Glass'
import PriceChart from '../components/PriceChart'
import useSpotTickers from '../hooks/useSpotTickers'
import TickerTable from '../components/TickerTable'

export default function ChartsView({ active, onSelect }) {
  const { tickers, loading } = useSpotTickers('okx', 0)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USDT')

  const topCoins = tickers
    ?.slice(0, 20)
    .filter(t => t.quoteVolume > 1000000)

  const handleRowClick = (ticker) => {
    setSelectedSymbol(ticker.symbol)
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Price Charts</Heading>

      {loading ? (
        <Glass p={8}>
          <VStack spacing={3}>
            <Spinner size="xl" color="blue.400" />
            <Text color="gray.400" fontSize="sm">Loading market data...</Text>
          </VStack>
        </Glass>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} alignItems="start">
          {/* Chart Display */}
          <Box>
            <Glass p={5} mb={4}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">{selectedSymbol}</Heading>
              </HStack>
            </Glass>
            <PriceChart symbol={selectedSymbol} />
          </Box>

          {/* Coin Selection */}
          <Glass p={5} maxH="800px" overflowY="auto">
            <Heading size="md" mb={4}>Select Coin</Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Top {topCoins?.length || 0} coins by volume
            </Text>
            <TickerTable
              tickers={topCoins}
              onRowClick={handleRowClick}
              hideVolume={false}
            />
          </Glass>
        </SimpleGrid>
      )}
    </Box>
  )
}
