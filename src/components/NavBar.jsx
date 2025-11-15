import { BellIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  Spacer,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import Glass from './Glass'
import { useI18n } from '../i18n'
import { useSource } from '../state/source'
import { useNotify } from '../state/notify'
import { useChangeWindow } from '../state/changeWindow'

export default function NavBar({ view, onChangeView, onOpenMobile }) {
  const { t, lang, setLang } = useI18n()
  const { colorMode, toggleColorMode } = useColorMode()
  const { source, setSource } = useSource()
  const { enabled: notifEnabled, setEnabled: setNotifEnabled } = useNotify()
  const { window: changeWin, setWindow: setChangeWin } = useChangeWindow()

  const items = [
    { key: 'total', label: t('menu.globalOverview') },
    { key: 'summary', label: t('menu.spotMarket') },
    { key: 'ai', label: t('menu.aiSector') },
    { key: 'futures', label: t('menu.futuresMarket') },
    { key: 'surprise', label: t('menu.volumeSignals') },
    { key: 'oi', label: t('menu.openInterest') },
    { key: 'liquidations', label: t('menu.liquidationsFeed') },
  ]

  const showSourceSelect = view === 'summary' || view === 'ai' || view === 'surprise'

  return (
    <Box position="sticky" top={0} zIndex={1000} px={{ base: 3, md: 6 }} py={1}>
      <Box maxW="90rem" mx="auto">
        <Glass p={{ base: 1.5, md: 2 }}>
          <Flex align="center" gap={2} minH="56px">
          <IconButton
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onOpenMobile}
            aria-label="menu"
            icon={<HamburgerIcon />}
            variant="outline"
            borderRadius="full"
            mr={1}
          />
          <HStack spacing={2} minW={{ base: 'auto', md: '200px' }}>
            <Image src="/pepe.svg" alt="logo" boxSize={6} borderRadius="md" />
            <Box as="span" fontWeight="semibold">GlassMarkets</Box>
          </HStack>

          {/* No navbar menu tabs on desktop */}

          <Spacer />

          <HStack spacing={2}>
            {/* Change window toggle */}
            <ButtonGroup isAttached size="sm" variant="outline" borderRadius="full">
              {['1h','4h','24h'].map((w) => (
                <Button key={w} borderRadius="full" onClick={() => setChangeWin(w)} variant={changeWin === w ? 'solid' : 'outline'}>{w.toUpperCase()}</Button>
              ))}
            </ButtonGroup>
            {/* Source segmented toggle (desktop) */}
            {showSourceSelect && (
              <ButtonGroup isAttached size="sm" variant="outline" borderRadius="full" display={{ base: 'none', md: 'inline-flex' }}>
                <Button
                  borderRadius="full"
                  onClick={() => setSource('OKX')}
                  colorScheme={source === 'OKX' ? 'blue' : undefined}
                  variant={source === 'OKX' ? 'solid' : 'outline'}
                >
                  OKX
                </Button>
                <Button
                  borderRadius="full"
                  onClick={() => setSource('Binance')}
                  colorScheme={source === 'Binance' ? 'yellow' : undefined}
                  variant={source === 'Binance' ? 'solid' : 'outline'}
                >
                  Binance
                </Button>
              </ButtonGroup>
            )}

            {/* Language toggle */}
            <ButtonGroup isAttached size="sm" variant="outline" borderRadius="full">
              <Button borderRadius="full" onClick={() => setLang('en')} variant={lang === 'en' ? 'solid' : 'outline'}>EN</Button>
              <Button borderRadius="full" onClick={() => setLang('vi')} variant={lang === 'vi' ? 'solid' : 'outline'}>VI</Button>
            </ButtonGroup>

            <Tooltip label={notifEnabled ? 'Disable alerts' : 'Enable alerts'}>
              <IconButton aria-label="toggle notifications" onClick={() => setNotifEnabled((v) => !v)} size="sm" icon={<BellIcon />} colorScheme={notifEnabled ? 'green' : undefined} variant={notifEnabled ? 'solid' : 'outline'} borderRadius="full" />
            </Tooltip>
            <IconButton aria-label="toggle color mode" onClick={toggleColorMode} size="sm" icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />} />
          </HStack>
        </Flex>

        {/* No navbar menu tabs on mobile */}
        </Glass>
      </Box>
    </Box>
  )
}
