import { BellIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Image,
  Spacer,
  Text,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import Glass from './Glass'
import { useI18n } from '../i18n'
import { useSource } from '../state/source'
import { useNotify } from '../state/notify'
import { useChangeWindow } from '../state/changeWindow'
import { getNavItems } from '../config/navItems'
import { QuickActionsMenu, SettingsMenu, UserMenu } from './MenuDropdowns'

export default function NavBar({ view, onChangeView, onOpenMobile }) {
  const { t, lang, setLang } = useI18n()
  const { colorMode, toggleColorMode } = useColorMode()
  const { source, setSource } = useSource()
  const { enabled: notifEnabled, setEnabled: setNotifEnabled } = useNotify()
  const { window: changeWin, setWindow: setChangeWin } = useChangeWindow()

  const items = getNavItems(t)

  const showSourceSelect = view === 'summary' || view === 'ai' || view === 'surprise'
  const showTimeWindow = view === 'summary' || view === 'ai' || view === 'surprise'

  // Hide/show navbar on scroll (mobile only)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Only apply on mobile (check window width)
      if (window.innerWidth >= 768) {
        setIsVisible(true)
        return
      }

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false)
      } else {
        // Scrolling up or near top
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      px={{ base: 3, md: 6 }}
      py={1}
      transform={{ base: isVisible ? 'translateY(0)' : 'translateY(-100%)', md: 'translateY(0)' }}
      transition="transform 0.3s ease-in-out"
    >
      <Box maxW="90rem" mx="auto">
        <Glass p={{ base: 1.5, md: 2 }}>
          {/* Desktop Layout */}
          <Flex align="center" gap={2} minH="56px" flexWrap="wrap" display={{ base: 'none', md: 'flex' }}>
            <HStack spacing={2}>
              <Image src="/pepe.svg" alt="GlassMarkets" boxSize={8} />
              <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                GlassMarkets
              </Text>
            </HStack>

            <Spacer />

            <HStack spacing={1} flexWrap="wrap" justify="flex-end" flex="1" minW="0">
              {/* Quick Actions Menu */}
              <QuickActionsMenu />

              {/* User Tools Menu */}
              <UserMenu />

              {/* Change window toggle */}
              {showTimeWindow && (
                <ButtonGroup isAttached size="sm" variant="outline" borderRadius="full">
                  {['1h','4h','24h'].map((w) => (
                    <Button key={w} borderRadius="full" onClick={() => setChangeWin(w)} variant={changeWin === w ? 'solid' : 'outline'}>{w.toUpperCase()}</Button>
                  ))}
                </ButtonGroup>
              )}

              {/* Source segmented toggle (desktop) */}
              {showSourceSelect && (
                <ButtonGroup isAttached size="sm" variant="outline" borderRadius="full">
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

              {/* Settings Menu */}
              <SettingsMenu source={source} setSource={setSource} />

              <Tooltip label={notifEnabled ? 'Disable alerts' : 'Enable alerts'}>
                <IconButton aria-label="toggle notifications" onClick={() => setNotifEnabled((v) => !v)} size="sm" icon={<BellIcon />} colorScheme={notifEnabled ? 'green' : undefined} variant={notifEnabled ? 'solid' : 'outline'} borderRadius="full" />
              </Tooltip>
            </HStack>
          </Flex>

          {/* Mobile Layout */}
          <Flex direction="column" gap={2} display={{ base: 'flex', md: 'none' }}>
            {/* Top row: Menu + Logo + Essential controls */}
            <Flex align="center" justify="space-between" minH="48px">
              <HStack spacing={2}>
                <IconButton
                  onClick={onOpenMobile}
                  aria-label="menu"
                  icon={<HamburgerIcon />}
                  variant="outline"
                  borderRadius="full"
                  size="sm"
                />
                <HStack spacing={1.5}>
                  <Image src="/pepe.svg" alt="GlassMarkets" boxSize={7} />
                  <Text fontSize="lg" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    GlassMarkets
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={1}>
                <Tooltip label={notifEnabled ? 'Disable alerts' : 'Enable alerts'}>
                  <IconButton
                    aria-label="toggle notifications"
                    onClick={() => setNotifEnabled((v) => !v)}
                    size="sm"
                    icon={<BellIcon />}
                    colorScheme={notifEnabled ? 'green' : undefined}
                    variant={notifEnabled ? 'solid' : 'outline'}
                    borderRadius="full"
                  />
                </Tooltip>
                <IconButton
                  aria-label="toggle color mode"
                  onClick={toggleColorMode}
                  size="sm"
                  icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                  borderRadius="full"
                />
              </HStack>
            </Flex>

            {/* Second row: Compact controls */}
            <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
              {/* Change window toggle */}
              {showTimeWindow && (
                <ButtonGroup isAttached size="xs" variant="outline" borderRadius="full" flex="1" minW="fit-content">
                  {['1h','4h','24h'].map((w) => (
                    <Button
                      key={w}
                      borderRadius="full"
                      onClick={() => setChangeWin(w)}
                      variant={changeWin === w ? 'solid' : 'outline'}
                      flex="1"
                    >
                      {w.toUpperCase()}
                    </Button>
                  ))}
                </ButtonGroup>
              )}

              {/* Language toggle */}
              <ButtonGroup isAttached size="xs" variant="outline" borderRadius="full">
                <Button borderRadius="full" onClick={() => setLang('en')} variant={lang === 'en' ? 'solid' : 'outline'}>EN</Button>
                <Button borderRadius="full" onClick={() => setLang('vi')} variant={lang === 'vi' ? 'solid' : 'outline'}>VI</Button>
              </ButtonGroup>

              {/* Source toggle for mobile */}
              {showSourceSelect && (
                <ButtonGroup isAttached size="xs" variant="outline" borderRadius="full" flex="1" minW="fit-content">
                  <Button
                    borderRadius="full"
                    onClick={() => setSource('OKX')}
                    colorScheme={source === 'OKX' ? 'blue' : undefined}
                    variant={source === 'OKX' ? 'solid' : 'outline'}
                    flex="1"
                  >
                    OKX
                  </Button>
                  <Button
                    borderRadius="full"
                    onClick={() => setSource('Binance')}
                    colorScheme={source === 'Binance' ? 'yellow' : undefined}
                    variant={source === 'Binance' ? 'solid' : 'outline'}
                    flex="1"
                  >
                    Binance
                  </Button>
                </ButtonGroup>
              )}
            </Flex>
          </Flex>
        </Glass>
      </Box>
    </Box>
  )
}
