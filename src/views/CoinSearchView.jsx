import { Badge, Box, Button, Divider, Flex, Grid, Heading, HStack, Image, Input, InputGroup, InputLeftElement, Link, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
import { SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import Glass from '../components/Glass'
import { formatNumber, formatUSD, formatPct } from '../utils/number'
import axios from 'axios'

// Use proxy settings from environment
const PROXY_BASE = import.meta?.env?.VITE_PROXY_BASE || ''
const isDev = !!import.meta?.env?.DEV

function cgUrl(path) {
  if (isDev) return `/_cg${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/cg${path}`
  return `https://api.coingecko.com${path}`
}

export default function CoinSearchView() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedChain, setSelectedChain] = useState('ethereum')

  // Detect if query is a contract address
  const isContractAddress = (q) => {
    const trimmed = q.trim()
    // Ethereum/BSC/Polygon address (0x...)
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return true
    // Solana address
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return true
    return false
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setResults(null)

    try {
      const isAddress = isContractAddress(query)

      // Search DexScreener if it's a contract address
      let dexData = null
      if (isAddress) {
        try {
          console.log('DexScreener searching for address:', query.trim())
          const dexRes = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${query.trim()}`, { timeout: 10000 })
          const pairs = dexRes?.data?.pairs || []
          // Filter by selected chain if not 'all'
          const filtered = selectedChain === 'all'
            ? pairs
            : pairs.filter(p => p.chainId?.toLowerCase() === selectedChain.toLowerCase())
          dexData = filtered.slice(0, 5) // Top 5 pairs
          console.log('DexScreener result:', dexData)
        } catch (e) {
          console.error('DexScreener error:', e)
        }
      }

      // Search CoinGecko (only for non-address searches)
      let cgData = null
      if (!isAddress) {
        try {
          const cgUrl_search = cgUrl(`/api/v3/search?query=${encodeURIComponent(query.trim())}`)
          const cgRes = await axios.get(cgUrl_search, { timeout: 10000 })
          const coins = cgRes?.data?.coins || []

          if (coins.length > 0) {
            const topCoin = coins[0]
            // Get details
            try {
              const detailUrl = cgUrl(`/api/v3/coins/${topCoin.id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`)
              const detailRes = await axios.get(detailUrl, { timeout: 10000 })
              cgData = {
                ...topCoin,
                details: detailRes?.data
              }
            } catch (e) {
              cgData = topCoin
            }
          }
        } catch (e) {
          console.error('CoinGecko error:', e)
        }
      }

      // Search OKX (only for non-address searches)
      let okxData = null
      if (!isAddress) {
        try {
          const symbol = query.trim().toUpperCase()
          // Handle various input formats: ETH, ETHUSDT, ETH-USDT
          let okxSymbol
          if (symbol.includes('-')) {
            okxSymbol = symbol // Already has dash
          } else if (symbol.includes('USDT')) {
            okxSymbol = symbol.replace('USDT', '-USDT')
          } else {
            okxSymbol = `${symbol}-USDT`
          }
          console.log('OKX searching for:', okxSymbol)
          const okxRes = await axios.get(`https://www.okx.com/api/v5/market/ticker?instId=${okxSymbol}`, { timeout: 10000 })
          okxData = okxRes?.data?.data?.[0] || null
          console.log('OKX result:', okxData)
        } catch (e) {
          console.error('OKX error:', e)
        }
      }

      // Search Binance (only for non-address searches)
      let binanceData = null
      if (!isAddress) {
        try {
          const symbol = query.trim().toUpperCase()
          // Handle various input formats: ETH, ETHUSDT, ETH-USDT
          let binanceSymbol
          if (symbol.includes('USDT')) {
            binanceSymbol = symbol.replace('-', '').replace('_', '')
          } else {
            binanceSymbol = symbol.replace('-', '').replace('_', '') + 'USDT'
          }
          console.log('Binance searching for:', binanceSymbol)
          const binanceRes = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`, { timeout: 10000 })
          binanceData = binanceRes?.data || null
          console.log('Binance result:', binanceData)
        } catch (e) {
          console.error('Binance error:', e)
        }
      }

      // Set results
      setResults({
        query: query.trim(),
        isAddress,
        dexscreener: dexData,
        coingecko: cgData,
        okx: okxData,
        binance: binanceData
      })

    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Coin Search</Heading>

      {/* Search Bar */}
      <Glass p={4} mb={6}>
        <VStack spacing={3}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, symbol, or contract address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="whiteAlpha.200"
              _hover={{ bg: 'whiteAlpha.300' }}
              _focus={{ bg: 'whiteAlpha.300', borderColor: 'blue.400' }}
              borderRadius="full"
              fontSize="md"
            />
          </InputGroup>

          {/* Chain Selector - only show if it looks like an address */}
          {isContractAddress(query) && (
            <HStack w="100%" spacing={2} flexWrap="wrap">
              <Text fontSize="sm" color="gray.400">Chain:</Text>
              <Button
                size="xs"
                variant={selectedChain === 'all' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('all')}
              >
                All
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'ethereum' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('ethereum')}
              >
                Ethereum
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'bsc' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('bsc')}
              >
                BSC
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'polygon' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('polygon')}
              >
                Polygon
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'solana' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('solana')}
              >
                Solana
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'base' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('base')}
              >
                Base
              </Button>
              <Button
                size="xs"
                variant={selectedChain === 'arbitrum' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setSelectedChain('arbitrum')}
              >
                Arbitrum
              </Button>
            </HStack>
          )}

          <Button
            onClick={handleSearch}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            w={{ base: '100%', md: 'auto' }}
            px={8}
            isLoading={searching}
            loadingText="Searching..."
          >
            Search
          </Button>
          <Text fontSize="xs" color="gray.500">
            Search by symbol across CEXs or by contract address across DEXs
          </Text>
        </VStack>
      </Glass>

      {/* Error */}
      {error && (
        <Glass p={6} mb={6}>
          <VStack spacing={2}>
            <Text color="red.400" fontWeight="semibold">Error</Text>
            <Text color="gray.400" fontSize="sm">{error}</Text>
          </VStack>
        </Glass>
      )}

      {/* Loading */}
      {searching && (
        <Glass p={6}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.400" thickness="4px" />
            <Text color="gray.400">Searching across multiple sources...</Text>
          </VStack>
        </Glass>
      )}

      {/* Results */}
      {!searching && results && (
        <VStack spacing={6} align="stretch">
          {/* DexScreener Section - for contract addresses */}
          {results.dexscreener && results.dexscreener.length > 0 && (
            <VStack spacing={4} align="stretch">
              <Heading size="md">DexScreener Results ({results.dexscreener.length} pairs)</Heading>
              {results.dexscreener.map((pair, idx) => (
                <Glass key={idx} p={5}>
                  <Flex justify="space-between" align="start" mb={3} flexWrap="wrap" gap={3}>
                    <HStack spacing={3}>
                      {pair.info?.imageUrl && (
                        <Image src={pair.info.imageUrl} boxSize={10} borderRadius="full" fallbackSrc="https://via.placeholder.com/40" />
                      )}
                      <VStack align="start" spacing={0}>
                        <Heading size="sm">{pair.baseToken?.symbol || 'Unknown'}</Heading>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="purple" fontSize="xs">{pair.chainId}</Badge>
                          <Badge colorScheme="gray" fontSize="xs">{pair.dexId}</Badge>
                          <Text fontSize="xs" color="gray.400">{pair.pairAddress?.slice(0, 6)}...{pair.pairAddress?.slice(-4)}</Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <Link href={pair.url} isExternal>
                      <Button size="sm" rightIcon={<ExternalLinkIcon />} variant="outline" borderRadius="full">
                        View on DexScreener
                      </Button>
                    </Link>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    <InfoCard
                      label="Price USD"
                      value={pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(8)}` : '-'}
                      change={pair.priceChange?.h24}
                    />
                    <InfoCard
                      label="Liquidity"
                      value={formatUSD(pair.liquidity?.usd)}
                    />
                    <InfoCard
                      label="24h Volume"
                      value={formatUSD(pair.volume?.h24)}
                    />
                    <InfoCard
                      label="FDV"
                      value={formatUSD(pair.fdv)}
                    />
                  </SimpleGrid>
                </Glass>
              ))}
            </VStack>
          )}

          {/* CoinGecko Section */}
          {results.coingecko && (
            <Glass p={6}>
              <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                  {results.coingecko.thumb && (
                    <Image src={results.coingecko.thumb} boxSize={12} borderRadius="full" fallbackSrc="https://via.placeholder.com/48" />
                  )}
                  <VStack align="start" spacing={0}>
                    <Heading size="md">{results.coingecko.name || 'Unknown'}</Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="blue" fontSize="sm">{results.coingecko.symbol?.toUpperCase() || 'N/A'}</Badge>
                      {results.coingecko.market_cap_rank && (
                        <Badge variant="outline" fontSize="xs">Rank #{results.coingecko.market_cap_rank}</Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                {results.coingecko.id && (
                  <Link href={`https://www.coingecko.com/en/coins/${results.coingecko.id}`} isExternal>
                    <Button size="sm" rightIcon={<ExternalLinkIcon />} variant="outline" borderRadius="full">
                      CoinGecko
                    </Button>
                  </Link>
                )}
              </Flex>

              {results.coingecko.details && (
                <>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                    <InfoCard
                      label="Price"
                      value={formatUSD(results.coingecko.details.market_data?.current_price?.usd)}
                      change={results.coingecko.details.market_data?.price_change_percentage_24h}
                    />
                    <InfoCard
                      label="Market Cap"
                      value={formatUSD(results.coingecko.details.market_data?.market_cap?.usd)}
                    />
                    <InfoCard
                      label="24h Volume"
                      value={formatUSD(results.coingecko.details.market_data?.total_volume?.usd)}
                    />
                    <InfoCard
                      label="Circulating Supply"
                      value={formatNumber(results.coingecko.details.market_data?.circulating_supply, { notation: 'compact', maximumFractionDigits: 2 })}
                    />
                  </SimpleGrid>

                  {results.coingecko.details.description?.en && (
                    <Box>
                      <Text fontSize="sm" color="gray.300" noOfLines={3}>
                        {results.coingecko.details.description.en.replace(/<[^>]*>/g, '').substring(0, 300)}...
                      </Text>
                    </Box>
                  )}
                </>
              )}
            </Glass>
          )}

          {/* Exchange Data Section */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* OKX Data */}
            {results.okx && (
              <Glass p={5}>
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm">OKX Market Data</Heading>
                  <Badge colorScheme="blue">Live</Badge>
                </HStack>
                <VStack align="stretch" spacing={2}>
                  <DataRow label="Last Price" value={formatUSD(results.okx.last)} />
                  <DataRow label="24h High" value={formatUSD(results.okx.high24h)} />
                  <DataRow label="24h Low" value={formatUSD(results.okx.low24h)} />
                  <DataRow label="24h Volume" value={formatUSD(results.okx.volCcy24h)} />
                </VStack>
              </Glass>
            )}

            {/* Binance Data */}
            {results.binance && (
              <Glass p={5}>
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm">Binance Market Data</Heading>
                  <Badge colorScheme="yellow">Live</Badge>
                </HStack>
                <VStack align="stretch" spacing={2}>
                  <DataRow label="Last Price" value={formatUSD(results.binance.lastPrice)} />
                  <DataRow label="24h Change" value={formatPct(results.binance.priceChangePercent)} isChange />
                  <DataRow label="24h High" value={formatUSD(results.binance.highPrice)} />
                  <DataRow label="24h Low" value={formatUSD(results.binance.lowPrice)} />
                  <DataRow label="24h Volume" value={formatUSD(results.binance.quoteVolume)} />
                </VStack>
              </Glass>
            )}
          </SimpleGrid>

          {/* No Results */}
          {!results.coingecko && !results.okx && !results.binance && !results.dexscreener?.length && (
            <Glass p={8}>
              <VStack spacing={3}>
                <SearchIcon boxSize={12} color="gray.500" />
                <Text fontSize="lg" color="gray.400">No results found for "{results.query}"</Text>
                <Text fontSize="sm" color="gray.500">
                  {results.isAddress ? 'Try a different contract address or chain' : 'Try searching with a different name or symbol'}
                </Text>
              </VStack>
            </Glass>
          )}
        </VStack>
      )}

      {/* Initial State */}
      {!searching && !results && !error && (
        <Glass p={8}>
          <VStack spacing={4}>
            <SearchIcon boxSize={16} color="gray.600" />
            <Heading size="md" color="gray.400">Search for any cryptocurrency</Heading>
            <Text color="gray.500" textAlign="center">
              Enter a coin name (e.g., "Bitcoin"), symbol (e.g., "BTC"), or contract address (e.g., "0x...") to see aggregated information from multiple sources
            </Text>
          </VStack>
        </Glass>
      )}
    </Box>
  )
}

function InfoCard({ label, value, change }) {
  return (
    <Glass p={4} bg="whiteAlpha.50">
      <VStack align="start" spacing={1}>
        <Text fontSize="xs" color="gray.500">{label}</Text>
        <Text fontSize="lg" fontWeight="semibold">{value || '-'}</Text>
        {change != null && (
          <Text fontSize="xs" color={change >= 0 ? 'green.400' : 'red.400'}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
          </Text>
        )}
      </VStack>
    </Glass>
  )
}

function DataRow({ label, value, isChange }) {
  let color = 'white'
  if (isChange && value) {
    const numValue = parseFloat(String(value).replace('%', '').replace('+', ''))
    color = numValue >= 0 ? 'green.400' : 'red.400'
  }

  return (
    <HStack justify="space-between">
      <Text fontSize="sm" color="gray.400">{label}</Text>
      <Text fontSize="md" fontWeight="semibold" color={color}>{value || '-'}</Text>
    </HStack>
  )
}
