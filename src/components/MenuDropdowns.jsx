import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  IconButton,
  Tooltip,
  Box,
  Text,
  HStack,
  Badge,
  useToast,
  Portal
} from '@chakra-ui/react'
import {
  ChevronDownIcon,
  SettingsIcon,
  ExternalLinkIcon,
  DownloadIcon,
  EmailIcon,
  RepeatIcon,
  BellIcon,
  LockIcon,
  QuestionOutlineIcon,
  MoonIcon,
  SunIcon,
  PlusSquareIcon,
  UpDownIcon
} from '@chakra-ui/icons'
import { useI18n } from '../i18n'
import { useColorMode } from '@chakra-ui/react'
import { getQuickActions, getSettingsItems } from '../config/navItems'

export function QuickActionsMenu() {
  const { t } = useI18n()
  const toast = useToast()
  const quickActions = getQuickActions(t)

  const handleQuickAction = (action) => {
    switch (action) {
      case 'refresh':
        window.location.reload()
        break
      case 'export':
        // Export functionality
        toast({
          title: 'Export initiated',
          description: 'Your data is being exported...',
          status: 'info',
          duration: 3000,
        })
        break
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'GlassMarkets - Crypto Market Data',
            text: 'Check out this crypto market overview',
            url: window.location.href
          })
        } else {
          navigator.clipboard.writeText(window.location.href)
          toast({
            title: 'Link copied!',
            description: 'Share this link with others',
            status: 'success',
            duration: 3000,
          })
        }
        break
      case 'fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
        break
      default:
        break
    }
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        variant="outline"
        borderRadius="full"
        rightIcon={<ChevronDownIcon />}
        px={3}
        minW="fit-content"
      >
        <Text display={{ base: 'none', lg: 'inline' }}>Quick Actions</Text>
        <Text display={{ base: 'inline', lg: 'none' }}>⚡</Text>
      </MenuButton>
      <Portal>
        <MenuList bg="rgba(17,25,40,0.95)" backdropFilter="blur(16px)" border="none" zIndex={1500} boxShadow="xl" minW="200px">
          {quickActions.map((item) => (
            <MenuItem
              key={item.key}
              icon={<item.icon />}
              onClick={() => handleQuickAction(item.action)}
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              <HStack justify="space-between" w="100%">
                <Text>{item.label}</Text>
                {item.action === 'fullscreen' && document.fullscreenElement && (
                  <Badge size="sm" colorScheme="green">Exit</Badge>
                )}
              </HStack>
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem
            icon={<ExternalLinkIcon />}
            onClick={() => window.open('/api/health', '_blank')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            API Status
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
}

export function SettingsMenu({ source, setSource }) {
  const { t } = useI18n()
  const { colorMode, toggleColorMode } = useColorMode()
  const toast = useToast()
  const settingsItems = getSettingsItems(t)

  const handleSettingsAction = (key) => {
    switch (key) {
      case 'theme':
        toggleColorMode()
        toast({
          title: 'Theme changed',
          description: `Switched to ${colorMode === 'dark' ? 'light' : 'dark'} mode`,
          status: 'success',
          duration: 2000,
        })
        break
      case 'notifications':
        toast({
          title: 'Notifications',
          description: 'Notification settings coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'privacy':
        toast({
          title: 'Privacy',
          description: 'Privacy settings coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'preferences':
        toast({
          title: 'Preferences',
          description: 'Advanced preferences coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'help':
        window.open('/help', '_blank')
        break
      case 'contact':
        window.open('mailto:support@glassmarkets.com', '_blank')
        break
      default:
        break
    }
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="settings"
        icon={<SettingsIcon />}
        size="sm"
        variant="outline"
        borderRadius="full"
      />
      <Portal>
        <MenuList bg="rgba(17,25,40,0.95)" backdropFilter="blur(16px)" border="none" zIndex={1500} boxShadow="xl" minW="180px">
          <MenuItem
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={() => handleSettingsAction('theme')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            <HStack justify="space-between" w="100%">
              <Text>{t('menu.theme')}</Text>
              <Badge size="sm" colorScheme="blue">
                {colorMode === 'dark' ? 'Dark' : 'Light'}
              </Badge>
            </HStack>
          </MenuItem>
          <MenuItem
            icon={<BellIcon />}
            onClick={() => handleSettingsAction('notifications')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('menu.notifications')}
          </MenuItem>
          <MenuItem
            icon={<LockIcon />}
            onClick={() => handleSettingsAction('privacy')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('menu.privacy')}
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<QuestionOutlineIcon />}
            onClick={() => handleSettingsAction('help')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('menu.help')}
          </MenuItem>
          <MenuItem
            icon={<EmailIcon />}
            onClick={() => handleSettingsAction('contact')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('menu.contact')}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
}

export function UserMenu() {
  const { t } = useI18n()
  const toast = useToast()

  const handleUserAction = (action) => {
    switch (action) {
      case 'portfolio':
        toast({
          title: 'Portfolio',
          description: 'Portfolio management coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'watchlist':
        toast({
          title: 'Watchlist',
          description: 'Advanced watchlist coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'alerts':
        toast({
          title: 'Price Alerts',
          description: 'Price alerts coming soon',
          status: 'info',
          duration: 3000,
        })
        break
      case 'api':
        window.open('/docs', '_blank')
        break
      default:
        break
    }
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        variant="outline"
        borderRadius="full"
        rightIcon={<ChevronDownIcon />}
        leftIcon={<PlusSquareIcon />}
        px={3}
        minW="fit-content"
      >
        <Text display={{ base: 'none', lg: 'inline' }}>Tools</Text>
        <Text display={{ base: 'inline', lg: 'none' }} />
      </MenuButton>
      <Portal>
        <MenuList bg="rgba(17,25,40,0.95)" backdropFilter="blur(16px)" border="none" zIndex={1500} boxShadow="xl" minW="200px">
          <MenuItem
            icon={<PlusSquareIcon />}
            onClick={() => handleUserAction('portfolio')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Portfolio Tracker
          </MenuItem>
          <MenuItem
            icon={<UpDownIcon />}
            onClick={() => handleUserAction('watchlist')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Advanced Watchlist
          </MenuItem>
          <MenuItem
            icon={<BellIcon />}
            onClick={() => handleUserAction('alerts')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Price Alerts
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<ExternalLinkIcon />}
            onClick={() => handleUserAction('api')}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            API Documentation
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
}

export function MobileQuickActions() {
  const { t } = useI18n()
  const toast = useToast()

  const actions = [
    { icon: <RepeatIcon />, label: 'Refresh', action: 'refresh' },
    { icon: <EmailIcon />, label: 'Share', action: 'share' },
    { icon: <DownloadIcon />, label: 'Export', action: 'export' },
    { icon: <SettingsIcon />, label: 'Settings', action: 'settings' },
  ]

  const handleAction = (action) => {
    switch (action) {
      case 'refresh':
        window.location.reload()
        break
      case 'share':
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link copied!',
          status: 'success',
          duration: 2000,
        })
        break
      case 'export':
        toast({
          title: 'Export feature',
          description: 'Coming soon',
          status: 'info',
          duration: 2000,
        })
        break
      case 'settings':
        toast({
          title: 'Settings',
          description: 'Settings panel coming soon',
          status: 'info',
          duration: 2000,
        })
        break
      default:
        break
    }
  }

  return (
    <HStack spacing={1}>
      {actions.map((action, index) => (
        <Tooltip key={index} label={action.label}>
          <IconButton
            aria-label={action.label}
            icon={action.icon}
            size="xs"
            variant="outline"
            borderRadius="full"
            onClick={() => handleAction(action.action)}
          />
        </Tooltip>
      ))}
    </HStack>
  )
}