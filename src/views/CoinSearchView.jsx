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
      let okxOrderBook = null
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

          // Try to get order book data
          try {
            const orderBookRes = await axios.get(`https://www.okx.com/api/v5/market/books?instId=${okxSymbol}&sz=5`, { timeout: 10000 })
            okxOrderBook = orderBookRes?.data?.data?.[0] || null
          } catch (e) {
            console.error('OKX order book error:', e)
          }

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
        okxOrderBook: okxOrderBook,
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
      {/* Search Bar */}
      <Glass p={{ base: 4, md: 6 }} mb={6}>
        <VStack spacing={4}>
          <VStack spacing={2} w="100%">
            <Heading size="lg" textAlign="center" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Coin Search
            </Heading>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              Search by symbol across CEXs or by contract address across DEXs
            </Text>
          </VStack>

          <InputGroup size="lg" maxW="800px">
            <InputLeftElement pointerEvents="none" h="full">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, symbol, or contract address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="whiteAlpha.100"
              _hover={{ bg: 'whiteAlpha.200' }}
              _focus={{ bg: 'whiteAlpha.200', borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="full"
              fontSize="md"
              h="56px"
              px="3rem"
            />
          </InputGroup>

          {/* Chain Selector - only show if it looks like an address */}
          {isContractAddress(query) && (
            <VStack w="100%" spacing={2} maxW="800px">
              <HStack w="100%" spacing={2} flexWrap="wrap" justify="center">
                <Text fontSize="sm" color="gray.400" fontWeight="medium">Chain:</Text>
                <Button
                  size="sm"
                  variant={selectedChain === 'all' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('all')}
                  borderRadius="full"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'ethereum' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('ethereum')}
                  borderRadius="full"
                >
                  Ethereum
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'bsc' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('bsc')}
                  borderRadius="full"
                >
                  BSC
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'polygon' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('polygon')}
                  borderRadius="full"
                >
                  Polygon
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'solana' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('solana')}
                  borderRadius="full"
                >
                  Solana
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'base' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('base')}
                  borderRadius="full"
                >
                  Base
                </Button>
                <Button
                  size="sm"
                  variant={selectedChain === 'arbitrum' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setSelectedChain('arbitrum')}
                  borderRadius="full"
                >
                  Arbitrum
                </Button>
              </HStack>
            </VStack>
          )}

          <Button
            onClick={handleSearch}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            w={{ base: '100%', md: 'auto' }}
            minW="200px"
            px={10}
            isLoading={searching}
            loadingText="Searching..."
            isDisabled={!query.trim()}
            _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
          >
            Search
          </Button>
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
              <HStack>
                <Heading size="md">DexScreener Results</Heading>
                <Badge colorScheme="purple" fontSize="sm" px={2} py={1} borderRadius="full">
                  {results.dexscreener.length} {results.dexscreener.length === 1 ? 'pair' : 'pairs'}
                </Badge>
              </HStack>
              {results.dexscreener.map((pair, idx) => (
                <Glass key={idx} p={{ base: 4, md: 5 }} hoverLift>
                  <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
                    <HStack spacing={3}>
                      {pair.info?.imageUrl && (
                        <Image
                          src={pair.info.imageUrl}
                          boxSize={12}
                          borderRadius="full"
                          fallbackSrc="https://via.placeholder.com/48"
                          border="2px solid"
                          borderColor="whiteAlpha.200"
                        />
                      )}
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{pair.baseToken?.symbol || 'Unknown'}</Heading>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="purple" fontSize="xs" borderRadius="full">{pair.chainId}</Badge>
                          <Badge colorScheme="blue" fontSize="xs" borderRadius="full">{pair.dexId}</Badge>
                          <Text fontSize="xs" color="gray.400" fontFamily="mono">{pair.pairAddress?.slice(0, 6)}...{pair.pairAddress?.slice(-4)}</Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <Link href={pair.url} isExternal>
                      <Button size="sm" rightIcon={<ExternalLinkIcon />} colorScheme="purple" variant="outline" borderRadius="full">
                        View
                      </Button>
                    </Link>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
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

                  {/* Additional DEX Info */}
                  <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={3}>
                    <Heading size="xs" mb={3} color="gray.400">Price Changes</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>5m Change</Text>
                        <Text fontSize="sm" fontWeight="semibold" color={pair.priceChange?.m5 >= 0 ? 'green.400' : 'red.400'}>
                          {pair.priceChange?.m5 != null ? `${pair.priceChange.m5 >= 0 ? '+' : ''}${pair.priceChange.m5.toFixed(2)}%` : '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>1h Change</Text>
                        <Text fontSize="sm" fontWeight="semibold" color={pair.priceChange?.h1 >= 0 ? 'green.400' : 'red.400'}>
                          {pair.priceChange?.h1 != null ? `${pair.priceChange.h1 >= 0 ? '+' : ''}${pair.priceChange.h1.toFixed(2)}%` : '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>6h Change</Text>
                        <Text fontSize="sm" fontWeight="semibold" color={pair.priceChange?.h6 >= 0 ? 'green.400' : 'red.400'}>
                          {pair.priceChange?.h6 != null ? `${pair.priceChange.h6 >= 0 ? '+' : ''}${pair.priceChange.h6.toFixed(2)}%` : '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>24h Change</Text>
                        <Text fontSize="sm" fontWeight="semibold" color={pair.priceChange?.h24 >= 0 ? 'green.400' : 'red.400'}>
                          {pair.priceChange?.h24 != null ? `${pair.priceChange.h24 >= 0 ? '+' : ''}${pair.priceChange.h24.toFixed(2)}%` : '-'}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Heading size="xs" mb={3} color="gray.400">Trading Activity</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>24h Transactions</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatNumber((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0))}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>24h Buys</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="green.400">{formatNumber(pair.txns?.h24?.buys)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>24h Sells</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="red.400">{formatNumber(pair.txns?.h24?.sells)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Buy/Sell Ratio</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {pair.txns?.h24?.buys && pair.txns?.h24?.sells
                            ? (pair.txns.h24.buys / pair.txns.h24.sells).toFixed(2)
                            : '-'}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Heading size="xs" mb={3} color="gray.400">Volume Analysis</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>5m Volume</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatUSD(pair.volume?.m5)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>1h Volume</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatUSD(pair.volume?.h1)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>6h Volume</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatUSD(pair.volume?.h6)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>24h Volume</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatUSD(pair.volume?.h24)}</Text>
                      </Box>
                    </SimpleGrid>

                    <Heading size="xs" mb={3} color="gray.400">Additional Metrics</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Market Cap</Text>
                        <Text fontSize="sm" fontWeight="semibold">{formatUSD(pair.marketCap)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Price Native</Text>
                        <Text fontSize="sm" fontWeight="semibold">{pair.priceNative ? parseFloat(pair.priceNative).toFixed(8) : '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Quote Token</Text>
                        <Text fontSize="sm" fontWeight="semibold">{pair.quoteToken?.symbol || '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Pair Created</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toLocaleDateString() : '-'}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Glass>
              ))}
            </VStack>
          )}

          {/* CoinGecko Section */}
          {results.coingecko && (
            <Glass p={{ base: 4, md: 6 }} hoverLift>
              <Flex justify="space-between" align="start" mb={5} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                  {results.coingecko.thumb && (
                    <Image
                      src={results.coingecko.thumb}
                      boxSize={14}
                      borderRadius="full"
                      fallbackSrc="https://via.placeholder.com/56"
                      border="2px solid"
                      borderColor="whiteAlpha.200"
                    />
                  )}
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{results.coingecko.name || 'Unknown'}</Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="green" fontSize="sm" borderRadius="full">{results.coingecko.symbol?.toUpperCase() || 'N/A'}</Badge>
                      {results.coingecko.market_cap_rank && (
                        <Badge colorScheme="purple" variant="outline" fontSize="xs" borderRadius="full">Rank #{results.coingecko.market_cap_rank}</Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                {results.coingecko.id && (
                  <Link href={`https://www.coingecko.com/en/coins/${results.coingecko.id}`} isExternal>
                    <Button size="sm" rightIcon={<ExternalLinkIcon />} colorScheme="green" variant="outline" borderRadius="full">
                      CoinGecko
                    </Button>
                  </Link>
                )}
              </Flex>

              {results.coingecko.details && (
                <>
                  {/* Price Overview */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={5}>
                    <InfoCard
                      label="Price"
                      value={formatUSD(results.coingecko.details.market_data?.current_price?.usd)}
                      change={results.coingecko.details.market_data?.price_change_percentage_24h}
                    />
                    <InfoCard
                      label="Market Cap"
                      value={formatUSD(results.coingecko.details.market_data?.market_cap?.usd)}
                      change={results.coingecko.details.market_data?.market_cap_change_percentage_24h}
                    />
                    <InfoCard
                      label="24h Volume"
                      value={formatUSD(results.coingecko.details.market_data?.total_volume?.usd)}
                    />
                    <InfoCard
                      label="Volume/MCap"
                      value={results.coingecko.details.market_data?.total_volume?.usd && results.coingecko.details.market_data?.market_cap?.usd
                        ? `${((results.coingecko.details.market_data.total_volume.usd / results.coingecko.details.market_data.market_cap.usd) * 100).toFixed(2)}%`
                        : '-'}
                    />
                  </SimpleGrid>

                  {/* Additional Metrics */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={5}>
                    <InfoCard
                      label="Circulating Supply"
                      value={formatNumber(results.coingecko.details.market_data?.circulating_supply, { notation: 'compact', maximumFractionDigits: 2 })}
                    />
                    <InfoCard
                      label="Total Supply"
                      value={results.coingecko.details.market_data?.total_supply
                        ? formatNumber(results.coingecko.details.market_data.total_supply, { notation: 'compact', maximumFractionDigits: 2 })
                        : '∞'}
                    />
                    <InfoCard
                      label="Max Supply"
                      value={results.coingecko.details.market_data?.max_supply
                        ? formatNumber(results.coingecko.details.market_data.max_supply, { notation: 'compact', maximumFractionDigits: 2 })
                        : '∞'}
                    />
                    <InfoCard
                      label="Fully Diluted Valuation"
                      value={formatUSD(results.coingecko.details.market_data?.fully_diluted_valuation?.usd)}
                    />
                  </SimpleGrid>

                  {/* Market Metrics */}
                  <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                    <Heading size="sm" mb={3}>Market Metrics</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Market Cap Rank</Text>
                        <Text fontSize="lg" fontWeight="bold">#{results.coingecko.details.market_cap_rank || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">CoinGecko Rank</Text>
                        <Text fontSize="lg" fontWeight="bold">#{results.coingecko.details.coingecko_rank || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">CoinGecko Score</Text>
                        <Text fontSize="lg" fontWeight="bold">{results.coingecko.details.coingecko_score?.toFixed(2) || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Developer Score</Text>
                        <Text fontSize="lg" fontWeight="bold">{results.coingecko.details.developer_score?.toFixed(2) || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Community Score</Text>
                        <Text fontSize="lg" fontWeight="bold">{results.coingecko.details.community_score?.toFixed(2) || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Liquidity Score</Text>
                        <Text fontSize="lg" fontWeight="bold">{results.coingecko.details.liquidity_score?.toFixed(2) || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Public Interest</Text>
                        <Text fontSize="lg" fontWeight="bold">{results.coingecko.details.public_interest_score?.toFixed(2) || 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium" textTransform="uppercase">Watchlist Users</Text>
                        <Text fontSize="lg" fontWeight="bold">{formatNumber(results.coingecko.details.watchlist_portfolio_users)}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Categories and Platform */}
                  {(results.coingecko.details.categories?.length > 0 || results.coingecko.details.asset_platform_id) && (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                      <Heading size="sm" mb={3}>Categories & Platform</Heading>
                      {results.coingecko.details.asset_platform_id && (
                        <Box mb={3}>
                          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium" textTransform="uppercase">Platform</Text>
                          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                            {results.coingecko.details.asset_platform_id}
                          </Badge>
                          {results.coingecko.details.contract_address && (
                            <Text fontSize="xs" color="gray.400" mt={2} fontFamily="mono">
                              {results.coingecko.details.contract_address}
                            </Text>
                          )}
                        </Box>
                      )}
                      {results.coingecko.details.categories?.length > 0 && (
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium" textTransform="uppercase">Categories</Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {results.coingecko.details.categories.filter(c => c).slice(0, 10).map((cat, idx) => (
                              <Badge key={idx} colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="full">
                                {cat}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Genesis Date */}
                  {results.coingecko.details.genesis_date && (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                      <HStack>
                        <Text fontSize="sm" color="gray.400" fontWeight="medium">Genesis Date:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {new Date(results.coingecko.details.genesis_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ({Math.floor((Date.now() - new Date(results.coingecko.details.genesis_date)) / (1000 * 60 * 60 * 24))} days ago)
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Price Changes */}
                  <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                    <Heading size="sm" mb={3}>Price Changes</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
                      <PriceChangeCard
                        label="1h"
                        value={results.coingecko.details.market_data?.price_change_percentage_1h_in_currency?.usd}
                      />
                      <PriceChangeCard
                        label="24h"
                        value={results.coingecko.details.market_data?.price_change_percentage_24h}
                      />
                      <PriceChangeCard
                        label="7d"
                        value={results.coingecko.details.market_data?.price_change_percentage_7d}
                      />
                      <PriceChangeCard
                        label="14d"
                        value={results.coingecko.details.market_data?.price_change_percentage_14d}
                      />
                      <PriceChangeCard
                        label="30d"
                        value={results.coingecko.details.market_data?.price_change_percentage_30d}
                      />
                      <PriceChangeCard
                        label="60d"
                        value={results.coingecko.details.market_data?.price_change_percentage_60d}
                      />
                      <PriceChangeCard
                        label="1y"
                        value={results.coingecko.details.market_data?.price_change_percentage_1y}
                      />
                    </SimpleGrid>
                  </Box>

                  {/* High/Low */}
                  <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                    <Heading size="sm" mb={3}>Price Range</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">24h Range</Text>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.400">Low</Text>
                            <Text fontSize="md" fontWeight="bold">{formatUSD(results.coingecko.details.market_data?.low_24h?.usd)}</Text>
                          </VStack>
                          <Text color="gray.600">━━━</Text>
                          <VStack align="end" spacing={0}>
                            <Text fontSize="xs" color="gray.400">High</Text>
                            <Text fontSize="md" fontWeight="bold">{formatUSD(results.coingecko.details.market_data?.high_24h?.usd)}</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">All-Time</Text>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.400">ATL</Text>
                            <Text fontSize="md" fontWeight="bold" color="red.400">{formatUSD(results.coingecko.details.market_data?.atl?.usd)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {results.coingecko.details.market_data?.atl_date?.usd
                                ? new Date(results.coingecko.details.market_data.atl_date.usd).toLocaleDateString()
                                : '-'}
                            </Text>
                          </VStack>
                          <Text color="gray.600">━━━</Text>
                          <VStack align="end" spacing={0}>
                            <Text fontSize="xs" color="gray.400">ATH</Text>
                            <Text fontSize="md" fontWeight="bold" color="green.400">{formatUSD(results.coingecko.details.market_data?.ath?.usd)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {results.coingecko.details.market_data?.ath_date?.usd
                                ? new Date(results.coingecko.details.market_data.ath_date.usd).toLocaleDateString()
                                : '-'}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </SimpleGrid>
                  </Box>

                  {/* Links and Additional Info */}
                  {(results.coingecko.details.links?.homepage?.[0] ||
                    results.coingecko.details.links?.blockchain_site?.[0] ||
                    results.coingecko.details.links?.twitter_screen_name ||
                    results.coingecko.details.links?.telegram_channel_identifier) && (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="lg" mb={5}>
                      <Heading size="sm" mb={3}>Links</Heading>
                      <HStack spacing={2} flexWrap="wrap">
                        {results.coingecko.details.links?.homepage?.[0] && (
                          <Link href={results.coingecko.details.links.homepage[0]} isExternal>
                            <Button size="sm" variant="outline" borderRadius="full" leftIcon={<ExternalLinkIcon />}>
                              Website
                            </Button>
                          </Link>
                        )}
                        {results.coingecko.details.links?.blockchain_site?.[0] && (
                          <Link href={results.coingecko.details.links.blockchain_site[0]} isExternal>
                            <Button size="sm" variant="outline" borderRadius="full" leftIcon={<ExternalLinkIcon />}>
                              Explorer
                            </Button>
                          </Link>
                        )}
                        {results.coingecko.details.links?.twitter_screen_name && (
                          <Link href={`https://twitter.com/${results.coingecko.details.links.twitter_screen_name}`} isExternal>
                            <Button size="sm" variant="outline" borderRadius="full" colorScheme="twitter">
                              Twitter
                            </Button>
                          </Link>
                        )}
                        {results.coingecko.details.links?.telegram_channel_identifier && (
                          <Link href={`https://t.me/${results.coingecko.details.links.telegram_channel_identifier}`} isExternal>
                            <Button size="sm" variant="outline" borderRadius="full" colorScheme="telegram">
                              Telegram
                            </Button>
                          </Link>
                        )}
                        {results.coingecko.details.links?.subreddit_url && (
                          <Link href={results.coingecko.details.links.subreddit_url} isExternal>
                            <Button size="sm" variant="outline" borderRadius="full" colorScheme="orange">
                              Reddit
                            </Button>
                          </Link>
                        )}
                      </HStack>
                    </Box>
                  )}

                  {/* Description */}
                  {results.coingecko.details.description?.en && (
                    <Box bg="whiteAlpha.50" p={4} borderRadius="lg">
                      <Heading size="sm" mb={3}>About</Heading>
                      <Text fontSize="sm" color="gray.300" lineHeight="tall">
                        {results.coingecko.details.description.en.replace(/<[^>]*>/g, '').substring(0, 500)}
                        {results.coingecko.details.description.en.length > 500 ? '...' : ''}
                      </Text>
                    </Box>
                  )}
                </>
              )}
            </Glass>
          )}

          {/* Exchange Data Section */}
          {(results.okx || results.binance) && (
            <VStack spacing={3} align="stretch">
              <Heading size="md">Exchange Data</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* OKX Data */}
                {results.okx && (
                  <Glass p={5} hoverLift>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">OKX</Heading>
                      <Badge colorScheme="blue" borderRadius="full" px={2}>Live</Badge>
                    </HStack>
                    <VStack align="stretch" spacing={3}>
                      <DataRow label="Last Price" value={formatUSD(results.okx.last)} highlight />
                      <DataRow label="24h Change" value={formatPct(results.okx.last && results.okx.open24h ? ((parseFloat(results.okx.last) - parseFloat(results.okx.open24h)) / parseFloat(results.okx.open24h) * 100).toFixed(2) : null)} isChange />
                      <Divider />
                      <DataRow label="24h High" value={formatUSD(results.okx.high24h)} />
                      <DataRow label="24h Low" value={formatUSD(results.okx.low24h)} />
                      <DataRow label="24h Volume (Base)" value={formatNumber(results.okx.vol24h, { notation: 'compact', maximumFractionDigits: 2 })} />
                      <DataRow label="24h Volume (Quote)" value={formatUSD(results.okx.volCcy24h)} />
                      <DataRow label="Open (24h)" value={formatUSD(results.okx.open24h)} />
                      <DataRow label="Bid Price" value={formatUSD(results.okx.bidPx)} />
                      <DataRow label="Ask Price" value={formatUSD(results.okx.askPx)} />
                      <DataRow label="Bid-Ask Spread" value={results.okx.bidPx && results.okx.askPx ? formatUSD(parseFloat(results.okx.askPx) - parseFloat(results.okx.bidPx)) : '-'} />
                    </VStack>

                    {/* Order Book */}
                    {results.okxOrderBook && results.okxOrderBook.bids && results.okxOrderBook.asks && (
                      <Box mt={4} pt={4} borderTop="1px solid" borderColor="whiteAlpha.200">
                        <Heading size="xs" mb={3}>Order Book (Top 5)</Heading>
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="xs" color="green.400" mb={2} fontWeight="bold">BIDS</Text>
                            <VStack align="stretch" spacing={1}>
                              {results.okxOrderBook.bids.slice(0, 5).map((bid, idx) => (
                                <HStack key={idx} justify="space-between" fontSize="xs">
                                  <Text color="green.400">{formatUSD(bid[0])}</Text>
                                  <Text color="gray.400">{formatNumber(parseFloat(bid[1]))}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="red.400" mb={2} fontWeight="bold">ASKS</Text>
                            <VStack align="stretch" spacing={1}>
                              {results.okxOrderBook.asks.slice(0, 5).map((ask, idx) => (
                                <HStack key={idx} justify="space-between" fontSize="xs">
                                  <Text color="red.400">{formatUSD(ask[0])}</Text>
                                  <Text color="gray.400">{formatNumber(parseFloat(ask[1]))}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    )}
                  </Glass>
                )}

                {/* Binance Data */}
                {results.binance && (
                  <Glass p={5} hoverLift>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Binance</Heading>
                      <Badge colorScheme="yellow" borderRadius="full" px={2}>Live</Badge>
                    </HStack>
                    <VStack align="stretch" spacing={3}>
                      <DataRow label="Last Price" value={formatUSD(results.binance.lastPrice)} highlight />
                      <DataRow label="24h Change" value={formatPct(results.binance.priceChangePercent)} isChange />
                      <DataRow label="24h Change (Value)" value={formatUSD(results.binance.priceChange)} isChange />
                      <Divider />
                      <DataRow label="24h High" value={formatUSD(results.binance.highPrice)} />
                      <DataRow label="24h Low" value={formatUSD(results.binance.lowPrice)} />
                      <DataRow label="24h Volume (Base)" value={formatNumber(results.binance.volume, { notation: 'compact', maximumFractionDigits: 2 })} />
                      <DataRow label="24h Volume (Quote)" value={formatUSD(results.binance.quoteVolume)} />
                      <DataRow label="Weighted Avg Price" value={formatUSD(results.binance.weightedAvgPrice)} />
                      <DataRow label="Open Price" value={formatUSD(results.binance.openPrice)} />
                      <DataRow label="# of Trades" value={formatNumber(results.binance.count)} />
                      <Divider />
                      <DataRow label="Bid Price" value={formatUSD(results.binance.bidPrice)} />
                      <DataRow label="Bid Qty" value={formatNumber(results.binance.bidQty)} />
                      <DataRow label="Ask Price" value={formatUSD(results.binance.askPrice)} />
                      <DataRow label="Ask Qty" value={formatNumber(results.binance.askQty)} />
                      <DataRow label="Bid-Ask Spread" value={results.binance.bidPrice && results.binance.askPrice ? formatUSD(parseFloat(results.binance.askPrice) - parseFloat(results.binance.bidPrice)) : '-'} />
                      <DataRow label="Last Qty" value={formatNumber(results.binance.lastQty)} />
                      <DataRow label="Prev Close Price" value={formatUSD(results.binance.prevClosePrice)} />
                    </VStack>
                  </Glass>
                )}
              </SimpleGrid>
            </VStack>
          )}

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
    <Box
      p={4}
      bg="whiteAlpha.50"
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{ bg: 'whiteAlpha.100' }}
    >
      <VStack align="start" spacing={1.5}>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="lg" fontWeight="bold">{value || '-'}</Text>
        {change != null && (
          <HStack spacing={1}>
            <Text fontSize="sm" fontWeight="semibold" color={change >= 0 ? 'green.400' : 'red.400'}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
            </Text>
            <Text fontSize="xs" color="gray.500">24h</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  )
}

function PriceChangeCard({ label, value }) {
  if (value == null) return null

  return (
    <Box textAlign="center" p={2} bg="whiteAlpha.50" borderRadius="md">
      <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
      <Text
        fontSize="md"
        fontWeight="bold"
        color={value >= 0 ? 'green.400' : 'red.400'}
      >
        {value >= 0 ? '+' : ''}{value.toFixed(2)}%
      </Text>
    </Box>
  )
}

function DataRow({ label, value, isChange, highlight }) {
  let color = 'white'
  if (isChange && value) {
    const numValue = parseFloat(String(value).replace('%', '').replace('+', ''))
    color = numValue >= 0 ? 'green.400' : 'red.400'
  }

  return (
    <HStack justify="space-between" py={1}>
      <Text fontSize="sm" color="gray.400" fontWeight="medium">{label}</Text>
      <Text
        fontSize={highlight ? 'lg' : 'md'}
        fontWeight={highlight ? 'bold' : 'semibold'}
        color={color}
      >
        {value || '-'}
      </Text>
    </HStack>
  )
}
