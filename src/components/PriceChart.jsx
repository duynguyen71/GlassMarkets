import { Box, Spinner, Text, HStack, Button, ButtonGroup, VStack, SimpleGrid, Divider, Badge, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import Glass from './Glass'

// Candlestick chart component using lightweight-charts
export default function PriceChart({ symbol, source = 'okx', showTimeControls = true }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [interval, setInterval] = useState('1h')
  const [chartData, setChartData] = useState(null)
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)

  const isDev = !!import.meta?.env?.DEV
  const PROXY_BASE = import.meta?.env?.VITE_PROXY_BASE || ''

  function bnUrl(path) {
    if (isDev) return `/_bn${path}`
    if (PROXY_BASE) return `${PROXY_BASE}/bn${path}`
    return `https://api.binance.com${path}`
  }

  // Format price to remove unnecessary zeros
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00'

    const num = parseFloat(price)
    if (num === 0) return '0.00'

    // For prices >= 1, show 2 decimal places
    if (num >= 1) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    // For prices < 1, show appropriate decimal places
    const str = num.toString()
    if (str.includes('e')) {
      // Handle scientific notation
      return num.toFixed(8).replace(/\.?0+$/, '')
    }

    // Count decimal places
    const decimalIndex = str.indexOf('.')
    if (decimalIndex === -1) return num.toLocaleString()

    const decimalPlaces = str.length - decimalIndex - 1
    const significantZeros = str.substring(decimalIndex + 1).search(/[^0]/)

    if (significantZeros === -1) {
      return num.toFixed(2)
    }

    const neededDecimals = significantZeros + 3 // Show 3 significant digits after first non-zero
    const finalDecimals = Math.min(Math.max(neededDecimals, 2), 8)

    return num.toLocaleString('en-US', {
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).replace(/\.?0+$/, '')
  }

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
        // Handle both OKX format (BTC-USDT) and already clean format (BTCUSDT)
        const binanceSymbol = symbol.replace('-', '').toUpperCase()

        console.log('Fetching chart data for symbol:', binanceSymbol, 'interval:', intervalMap[interval])
        const url = bnUrl(`/api/v3/klines?symbol=${binanceSymbol}&interval=${intervalMap[interval]}&limit=100`)

        const response = await fetch(url, {
          cache: 'no-cache',
          mode: 'cors',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Received raw data:', data?.length, 'candles')

        if (!data || data.length === 0) {
          throw new Error('No data received')
        }

        const candleData = data.map((candle) => ({
          time: Math.floor(candle[0] / 1000), // Convert to seconds for lightweight-charts
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }))

        console.log('Processed candle data:', candleData.length, 'candles, sample:', candleData[0])
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
        background: {
          type: ColorType.Solid,
          color: 'transparent'
        },
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

    const candleSeries = chart.addSeries(CandlestickSeries, {
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
    if (candleSeriesRef.current) {
      let dataToUse = chartData

      // If no real data available, use mock data for demonstration
      if (!chartData || chartData.length === 0) {
        if (!loading && !error) {
          dataToUse = generateMockData()
          console.log('Using mock data for chart demonstration, data count:', dataToUse.length)
        }
      }

      if (dataToUse && dataToUse.length > 0) {
        console.log('Setting chart data:', dataToUse.length, 'candles')
        candleSeriesRef.current.setData(dataToUse)
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      } else {
        console.log('No data available for chart')
      }
    }
  }, [chartData, loading, error])

  if (!symbol) {
    return (
      <Glass p={5}>
        <Box textAlign="center">
          <Text color="gray.400">No symbol provided</Text>
        </Box>
      </Glass>
    )
  }

  // Generate mock data when real data is unavailable
  const generateMockData = () => {
    const mockData = []
    const basePrice = 50000 // Base price for mock data
    let currentPrice = basePrice

    for (let i = 0; i < 100; i++) {
      const time = Math.floor((Date.now() - (99 - i) * 3600000) / 1000) // Hourly intervals
      const volatility = 0.02 // 2% volatility
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrice

      const open = currentPrice
      const close = currentPrice + change
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice

      mockData.push({
        time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((Math.random() * 1000000).toFixed(2)),
      })

      currentPrice = close
    }

    return mockData
  }

  const latestCandle = chartData?.[chartData.length - 1]
  const firstCandle = chartData?.[0]
  const priceChange = latestCandle && firstCandle ? ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100 : 0

  return (
    <VStack spacing={4} align="stretch">
      {/* Interval Selection - Only show if enabled */}
      {showTimeControls && (
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
      )}

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
              <Text color="orange.400" fontWeight="semibold">Using demonstration data</Text>
              <Text fontSize="sm" color="gray.500">Live market data temporarily unavailable: {error}</Text>
            </VStack>
          </HStack>
        </Glass>
      )}

      {/* Always show chart container */}
      <Glass p={5}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.400">
              Candlestick Chart {error && '(Demo Data)'}
            </Text>
            {loading && <Spinner size="sm" color="blue.400" />}
          </HStack>
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
      {(() => {
        console.log('OHLC section check:', { loading, hasChartData: !!chartData, hasError: !!error, chartDataLength: chartData?.length })
        return !loading && (chartData || error)
      })() && (
        <Glass p={5}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.400">
              Period Change ({interval}) {error && '(Demo Data)'}
            </Text>
            <Badge colorScheme={priceChange >= 0 ? 'green' : 'red'} fontSize="lg" px={3} py={1}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </Badge>
          </HStack>

          <Divider borderColor="whiteAlpha.200" mb={4} />

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Open</Text>
              <Text fontSize="lg" fontWeight="bold">${formatPrice(firstCandle?.open)}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">High</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.400">
                ${chartData ? formatPrice(Math.max(...chartData.map(c => c.high))) : '0.00'}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Low</Text>
              <Text fontSize="lg" fontWeight="bold" color="red.400">
                ${chartData ? formatPrice(Math.min(...chartData.map(c => c.low))) : '0.00'}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Close</Text>
              <Text fontSize="lg" fontWeight="bold">${formatPrice(latestCandle?.close)}</Text>
            </VStack>
          </SimpleGrid>
        </Glass>
      )}
    </VStack>
  )
}
