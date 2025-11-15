import { BellIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Alert, AlertDescription, AlertIcon, Box, Flex, Heading, HStack, IconButton, Image, Select, SimpleGrid, Spacer, Text, Tooltip, useColorMode, useToast, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import useSpotTickers from './hooks/useSpotTickers'
import SummaryView from './views/SummaryView'
import OpenInterestView from './views/OpenInterestView'
import FuturesView from './views/FuturesView'
import SurpriseView from './views/SurpriseView'
import LiquidationsView from './views/LiquidationsView'
import TotalSummaryView from './views/TotalSummaryView'
import AICoinsView from './views/AICoinsView'
import Background from './components/Background'
import Glass from './components/Glass'
import SideNav from './components/SideNav'
import { useSource } from './state/source'
import { useNotify } from './state/notify'
import usePriceAlerts from './hooks/usePriceAlerts'
import usePopularityAlerts from './hooks/usePopularityAlerts'
import CoinModal from './components/CoinModal'
import MobileNav from './components/MobileNav'
import { useI18n } from './i18n'

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode()
  const toast = useToast()
  const { source, setSource } = useSource()
  const { tickers, loading, error, summary } = useSpotTickers(source)
  const [view, setView] = useLocalStorage('pref:view', 'total')
  const { enabled: notifEnabled, setEnabled: setNotifEnabled, canNotify } = useNotify()

  // Alerts (active only on Summary or Surprise views)
  usePriceAlerts({ tickers, thresholdPct: 50, enabled: view === 'summary' || view === 'surprise', source })
  usePopularityAlerts({ tickers, enabled: view === 'summary' || view === 'surprise', source })

  const [selected, setSelected] = useState(null)
  const closeDrawer = () => setSelected(null)

  const showSourceSelect = view === 'summary' || view === 'ai' || view === 'surprise'
  const mobileNav = useDisclosure()
  const { lang, setLang, t } = useI18n()

  useEffect(() => {
    if (error && !toast.isActive('err')) {
      toast({ id: 'err', title: 'Data fetch failed', description: String(error?.message || error), status: 'error', duration: 6000, isClosable: true })
    }
  }, [error, toast])

  // view persisted via useLocalStorage

  return (
    <Box minH="100vh" position="relative">
      <Background />
      <Box position="sticky" top={0} zIndex={1000} px={{ base: 2, md: 4 }} py={1}>
        <Glass p={{ base: 1, md: 2 }} mb={3} borderBottomWidth="1px" borderColor="whiteAlpha.200">
          <Flex align="center" gap={2} position="relative" minH="48px">
            <IconButton display={{ base: 'inline-flex', md: 'none' }} onClick={mobileNav.onOpen} aria-label="menu" icon={<HamburgerIcon />} variant="outline" borderRadius="full" />
            <HStack spacing={2}>
              <Image src="/pepe.svg" alt="logo" boxSize={5} borderRadius="md" />
              <Heading size="sm">GlassMarkets</Heading>
            </HStack>
            <Spacer />
            <HStack spacing={2} flexWrap="wrap" justify="flex-end" alignItems="center">
              <Select size="sm" h={8} value={lang} onChange={(e) => setLang(e.target.value)} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} borderRadius="full" px={2} minW="80px">
                <option value="en">EN</option>
                <option value="vi">VI</option>
              </Select>
              {showSourceSelect && (
                <Select size="sm" h={8} value={source} onChange={(e) => setSource(e.target.value)} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} borderRadius="full" px={2} minW="120px">
                  <option value="OKX">OKX</option>
                  <option value="Binance">Binance</option>
                </Select>
              )}
              <Tooltip label={notifEnabled ? 'Disable alerts' : 'Enable alerts'}>
                <IconButton aria-label="toggle notifications" onClick={() => setNotifEnabled((v) => !v)} size="sm" icon={<BellIcon />} colorScheme={notifEnabled ? 'green' : undefined} variant={notifEnabled ? 'solid' : 'outline'} borderRadius="full" h={8} minW={8} />
              </Tooltip>
              <IconButton aria-label="toggle color mode" onClick={toggleColorMode} size="sm" icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />} h={8} minW={8} />
            </HStack>
          </Flex>
        </Glass>

      {error && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <AlertDescription>
            Could not load live data. Check CORS/network and try again.
          </AlertDescription>
        </Alert>
      )}

        <SimpleGrid columns={{ base: 1, md: 8, lg: 12 }} gap={4} alignItems="start">
          <Box display={{ base: 'none', md: 'block' }} gridColumn={{ md: 'span 2', lg: 'span 3' }}>
            <SideNav active={view} onChange={setView} />
          </Box>
          <Box gridColumn={{ md: 'span 6', lg: 'span 9' }}>
            <Box display={view === 'total' ? 'block' : 'none'}>
              <TotalSummaryView />
            </Box>
            <Box display={view === 'summary' ? 'block' : 'none'}>
              <SummaryView tickers={tickers} loading={loading} summary={summary} onSelect={setSelected} />
            </Box>
            <Box display={view === 'ai' ? 'block' : 'none'}>
              <AICoinsView tickers={tickers} loading={loading} onSelect={setSelected} />
            </Box>
            <Box display={view === 'oi' ? 'block' : 'none'}>
              <OpenInterestView active={view === 'oi'} />
            </Box>
            <Box display={view === 'futures' ? 'block' : 'none'}>
              <FuturesView active={view === 'futures'} onSelect={setSelected} />
            </Box>
            <Box display={view === 'surprise' ? 'block' : 'none'}>
              <SurpriseView tickers={tickers} active={view === 'surprise'} onSelect={setSelected} />
            </Box>
            <Box display={view === 'liquidations' ? 'block' : 'none'}>
              <LiquidationsView active={view === 'liquidations'} />
            </Box>
            <Text mt={6} color="gray.400" fontSize="sm">Data source: OKX free public REST/WebSocket APIs.</Text>
          </Box>
        </SimpleGrid>
        <CoinModal isOpen={!!selected} onClose={closeDrawer} ticker={selected} source={source} symbolType={view === 'futures' ? 'FUTURES' : 'SPOT'} />
        <MobileNav isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} active={view} onChange={setView} />
      </Box>
    </Box>
  )
}
