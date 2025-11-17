import { Box, Spinner, Text, HStack, Button, ButtonGroup, VStack, SimpleGrid, Divider, Badge, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import axios from 'axios'
import Glass from './Glass'

// Candlestick chart component using lightweight-charts
export default function PriceChart({ symbol, source = 'okx' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [interval, setInterval] = useState('1h')
  const [chartData, setChartData] = useState(null)
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.05)', 'rgba(17, 25, 40, 0.5)')
  const textColor = useColorModeValue('#2D3748', '#E2E8F0')
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')

  useEffect(() => {
    if (!symbol) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const intervalMap = {
          '1m': '1m',
          '5m': '5m',
          '15m': '15m',
          '1h': '1h',
          '4h': '4h',
          '1d': '1d',
        }

        // Clean symbol for Binance format
        const binanceSymbol = symbol.replace('-', '').toUpperCase()
        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${intervalMap[interval]}&limit=100`

        const response = await axios.get(url, { timeout: 10000 })

        if (!response.data || response.data.length === 0) {
          throw new Error('No data received')
        }

        const candleData = response.data.map((candle) => ({
          time: Math.floor(candle[0] / 1000), // Convert to seconds for lightweight-charts
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }))

        setChartData(candleData)
        setLoading(false)
      } catch (err) {
        console.error('Chart data fetch error:', err)
        setError(err.message || 'Failed to load chart data')
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol, interval])

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        candleSeriesRef.current = null
      }
    }
  }, [textColor, gridColor])

  // Update chart data
  useEffect(() => {
    if (candleSeriesRef.current && chartData && chartData.length > 0) {
      candleSeriesRef.current.setData(chartData)
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    }
  }, [chartData])

  if (!symbol) {
    return (
      <Glass p={5}>
        <Box textAlign="center">
          <Text color="gray.400">No symbol provided</Text>
        </Box>
      </Glass>
    )
  }

  const latestCandle = chartData?.[chartData.length - 1]
  const firstCandle = chartData?.[0]
  const priceChange = latestCandle && firstCandle ? ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100 : 0

  return (
    <VStack spacing={4} align="stretch">
      {/* Interval Selection */}
      <Glass p={4}>
        <HStack justify="space-between" flexWrap="wrap" spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.400">Time Interval</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button onClick={() => setInterval('1m')} colorScheme={interval === '1m' ? 'blue' : 'gray'} fontSize="xs">1m</Button>
            <Button onClick={() => setInterval('5m')} colorScheme={interval === '5m' ? 'blue' : 'gray'} fontSize="xs">5m</Button>
            <Button onClick={() => setInterval('15m')} colorScheme={interval === '15m' ? 'blue' : 'gray'} fontSize="xs">15m</Button>
            <Button onClick={() => setInterval('1h')} colorScheme={interval === '1h' ? 'blue' : 'gray'} fontSize="xs">1h</Button>
            <Button onClick={() => setInterval('4h')} colorScheme={interval === '4h' ? 'blue' : 'gray'} fontSize="xs">4h</Button>
            <Button onClick={() => setInterval('1d')} colorScheme={interval === '1d' ? 'blue' : 'gray'} fontSize="xs">1d</Button>
          </ButtonGroup>
        </HStack>
      </Glass>

      {loading && (
        <Glass p={8}>
          <VStack spacing={3}>
            <Spinner size="xl" color="blue.400" />
            <Text color="gray.400" fontSize="sm">Loading chart data...</Text>
          </VStack>
        </Glass>
      )}

      {error && (
        <Glass p={5}>
          <HStack spacing={3}>
            <Text fontSize="2xl">⚠️</Text>
            <VStack align="start" spacing={1}>
              <Text color="red.400" fontWeight="semibold">Unable to load chart data</Text>
              <Text fontSize="sm" color="gray.500">{error}</Text>
            </VStack>
          </HStack>
        </Glass>
      )}

      {!loading && !error && chartData && (
        <>
          {/* Candlestick Chart */}
          <Glass p={5}>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400">
                Candlestick Chart
              </Text>
              <Box
                ref={chartContainerRef}
                width="100%"
                height="400px"
                borderRadius="lg"
                overflow="hidden"
                bg={bgColor}
              />
            </VStack>
          </Glass>

          {/* Chart Summary - OHLC */}
          <Glass p={5}>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400">
                Period Change ({interval})
              </Text>
              <Badge colorScheme={priceChange >= 0 ? 'green' : 'red'} fontSize="lg" px={3} py={1}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </Badge>
            </HStack>

            <Divider borderColor="whiteAlpha.200" mb={4} />

            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Open</Text>
                <Text fontSize="lg" fontWeight="bold">${firstCandle?.open.toFixed(6)}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">High</Text>
                <Text fontSize="lg" fontWeight="bold" color="green.400">
                  ${Math.max(...chartData.map(c => c.high)).toFixed(6)}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Low</Text>
                <Text fontSize="lg" fontWeight="bold" color="red.400">
                  ${Math.min(...chartData.map(c => c.low)).toFixed(6)}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">Close</Text>
                <Text fontSize="lg" fontWeight="bold">${latestCandle?.close.toFixed(6)}</Text>
              </VStack>
            </SimpleGrid>
          </Glass>
        </>
      )}
    </VStack>
  )
}
