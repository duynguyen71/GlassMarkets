import { Box, Heading, VStack, HStack, Text, Link, Spinner, Badge, Image } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import Glass from '../components/Glass'
import axios from 'axios'

export default function NewsView({ active }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!active) return

    const fetchNews = async () => {
      setLoading(true)
      setError(null)

      try {
        // Using CryptoCompare News API (free, no key required)
        const response = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', {
          timeout: 10000,
        })

        if (response.data && response.data.Data) {
          // Transform the data to our format
          const transformedNews = response.data.Data.slice(0, 20).map((item, index) => ({
            id: item.id || index,
            title: item.title,
            url: item.url || item.guid,
            published_at: new Date(item.published_on * 1000).toISOString(),
            source: item.source_info?.name || item.source,
            body: item.body,
            imageurl: item.imageurl,
            categories: item.categories?.split('|').filter(Boolean) || [],
          }))

          setNews(transformedNews)
        } else {
          throw new Error('No news data received')
        }
        setLoading(false)
      } catch (err) {
        console.error('News fetch error:', err)
        setError(err.message || 'Failed to load news')

        // Fallback to RSS-based news if CryptoCompare fails
        try {
          const rssResponse = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss', {
            timeout: 10000,
          })

          if (rssResponse.data && rssResponse.data.items) {
            const transformedNews = rssResponse.data.items.slice(0, 15).map((item, index) => ({
              id: index,
              title: item.title,
              url: item.link,
              published_at: item.pubDate,
              source: 'Cointelegraph',
              body: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
              categories: item.categories || [],
            }))

            setNews(transformedNews)
            setError(null)
          }
        } catch (rssErr) {
          console.error('RSS fallback error:', rssErr)
        }

        setLoading(false)
      }
    }

    fetchNews()

    // Refresh every 10 minutes
    const interval = setInterval(fetchNews, 600000)
    return () => clearInterval(interval)
  }, [active])

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'just now'
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Crypto News</Heading>
        {!loading && !error && (
          <Badge colorScheme="green" fontSize="sm" px={3} py={1}>Live Feed</Badge>
        )}
      </HStack>

      {loading ? (
        <Glass>
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4} color="gray.400">Loading latest news...</Text>
          </Box>
        </Glass>
      ) : error ? (
        <Glass p={4}>
          <Text color="red.400" mb={2}>⚠️ Unable to load news feed</Text>
          <Text fontSize="sm" color="gray.500">{error}</Text>
        </Glass>
      ) : (
        <VStack spacing={3} align="stretch">
          {news.map((item) => (
            <Glass key={item.id} p={4} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s', shadow: 'lg' }}>
              <HStack align="start" spacing={4}>
                {item.imageurl && (
                  <Box flexShrink={0} display={{ base: 'none', md: 'block' }}>
                    <Image
                      src={item.imageurl}
                      alt={item.title}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                      fallback={<Box w="80px" h="80px" bg="whiteAlpha.100" borderRadius="md" />}
                    />
                  </Box>
                )}

                <VStack align="stretch" spacing={2} flex="1">
                  <Link href={item.url} isExternal _hover={{ textDecor: 'none' }}>
                    <Heading size="sm" color="blue.300" _hover={{ color: 'blue.200' }}>
                      {item.title}
                    </Heading>
                  </Link>

                  {item.body && (
                    <Text fontSize="sm" color="gray.400" noOfLines={2}>
                      {item.body.replace(/<[^>]*>/g, '')}
                    </Text>
                  )}

                  <HStack spacing={3} flexWrap="wrap" fontSize="sm">
                    <HStack spacing={1}>
                      <Text color="gray.500">Source:</Text>
                      <Text color="gray.300" fontWeight="medium">{item.source}</Text>
                    </HStack>
                    <Text color="gray.600">•</Text>
                    <Text color="gray.400">{getTimeAgo(item.published_at)}</Text>
                  </HStack>

                  {item.categories && item.categories.length > 0 && (
                    <HStack spacing={2} flexWrap="wrap">
                      {item.categories.slice(0, 4).map((category, idx) => (
                        <Badge key={idx} colorScheme="purple" fontSize="xs" variant="subtle">
                          {category}
                        </Badge>
                      ))}
                    </HStack>
                  )}

                  <Link href={item.url} isExternal>
                    <HStack spacing={1} color="blue.400" fontSize="xs" _hover={{ color: 'blue.300' }}>
                      <Text>Read full article</Text>
                      <ExternalLinkIcon />
                    </HStack>
                  </Link>
                </VStack>
              </HStack>
            </Glass>
          ))}
        </VStack>
      )}

      <Glass mt={4} p={4}>
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" color="gray.400" fontWeight="semibold">
            📰 About News Data
          </Text>
          <Text fontSize="xs" color="gray.500">
            News is fetched from CryptoCompare API with RSS fallback from Cointelegraph. Updates every 10 minutes.
          </Text>
          <HStack spacing={2} fontSize="xs" color="gray.500" flexWrap="wrap">
            <Text>Sources:</Text>
            <Badge size="sm" variant="outline">CryptoCompare</Badge>
            <Badge size="sm" variant="outline">Cointelegraph RSS</Badge>
            <Badge size="sm" variant="outline">Live Data</Badge>
          </HStack>
        </VStack>
      </Glass>
    </Box>
  )
}
