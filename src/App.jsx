import { BellIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Alert, AlertDescription, AlertIcon, Box, Flex, Heading, HStack, IconButton, Image, Select, SimpleGrid, Spacer, Text, Tooltip, useColorMode, useToast, useDisclosure, Fade } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import useSpotTickers from './hooks/useSpotTickers'
import usePageVisibility from './hooks/usePageVisibility'
import SummaryView from './views/SummaryView'
import OpenInterestView from './views/OpenInterestView'
// import FuturesView from './views/FuturesView'
import SurpriseView from './views/SurpriseView'
import LiquidationsView from './views/LiquidationsView'
import TotalSummaryView from './views/TotalSummaryView'
import AICoinsView from './views/AICoinsView'
import FavoritesView from './views/FavoritesView'
import Background from './components/Background'
import Glass from './components/Glass'
import SideNav from './components/SideNav'
import ScrollToTop from './components/ScrollToTop'
import { useSource } from './state/source'
import { useNotify } from './state/notify'
import usePriceAlerts from './hooks/usePriceAlerts'
import usePopularityAlerts from './hooks/usePopularityAlerts'
import CoinModal from './components/CoinModal'
import MobileNav from './components/MobileNav'
import NavBar from './components/NavBar'
import { useI18n } from './i18n'

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode()
  const toast = useToast()
  const { source, setSource } = useSource()

  // Page visibility detection - trigger refresh after 1 minute of being idle
  const { shouldRefresh } = usePageVisibility(60000) // 60 seconds
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { tickers, loading, error, summary } = useSpotTickers(source, refreshTrigger)
  const [view, setView] = useLocalStorage('pref:view', 'total')
  const { enabled: notifEnabled, setEnabled: setNotifEnabled, canNotify } = useNotify()

  // Alerts (active only on Summary or Surprise views)
  usePriceAlerts({ tickers, thresholdPct: 50, enabled: view === 'summary' || view === 'surprise', source })
  usePopularityAlerts({ tickers, enabled: view === 'summary' || view === 'surprise', source })

  const [selected, setSelected] = useState(null)
  const closeDrawer = () => setSelected(null)

  const showSourceSelect = view === 'summary' || view === 'ai' || view === 'surprise'

  // Trigger data refresh when page becomes visible after being idle
  useEffect(() => {
    if (shouldRefresh) {
      setRefreshTrigger((prev) => prev + 1)
      toast({
        title: 'Data refreshed',
        description: 'Fetching latest market data',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      })
    }
  }, [shouldRefresh, toast])

  // Normalize hidden views
  useEffect(() => {
    if (view === 'futures' || view === 'binanceAlpha') setView('summary')
  }, [view, setView])
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
      <NavBar view={view} onChangeView={setView} onOpenMobile={mobileNav.onOpen} />

      <Box px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} maxW="90rem" mx="auto">
        {error && (
          <Alert status="warning" mb={4}>
            <AlertIcon />
            <AlertDescription>
              Could not load live data. Check CORS/network and try again.
            </AlertDescription>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 8, lg: 12 }} gap={{ base: 3, md: 4 }} alignItems="start">
          <Box display={{ base: 'none', md: 'block' }} gridColumn={{ md: 'span 2', lg: 'span 3' }}>
            <SideNav active={view} onChange={setView} />
          </Box>
          <Box gridColumn={{ md: 'span 6', lg: 'span 9' }}>
            <Fade in={true} transition={{ enter: { duration: 0.15 } }}>
              {view === 'total' && <TotalSummaryView active={true} />}
              {view === 'summary' && <SummaryView tickers={tickers} loading={loading} summary={summary} onSelect={setSelected} />}
              {view === 'ai' && <AICoinsView tickers={tickers} loading={loading} onSelect={setSelected} />}
              {view === 'favorites' && <FavoritesView tickers={tickers} loading={loading} onSelect={setSelected} />}
              {view === 'oi' && <OpenInterestView active={true} />}
              {view === 'surprise' && <SurpriseView tickers={tickers} active={true} onSelect={setSelected} />}
              {view === 'liquidations' && <LiquidationsView active={true} />}
            </Fade>
            <Text mt={6} color="gray.400" fontSize="sm">Data source: OKX free public REST/WebSocket APIs.</Text>
          </Box>
        </SimpleGrid>
      </Box>
        <CoinModal isOpen={!!selected} onClose={closeDrawer} ticker={selected} source={source} symbolType={view === 'futures' ? 'FUTURES' : 'SPOT'} />
        <MobileNav isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} active={view} onChange={setView} />
        <ScrollToTop />
      </Box>
  )
}
