import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Button, Box, Text, VStack, HStack, Divider, Badge, useColorMode } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import { getMobileNavItems, getMobileQuickActions, getMobileSettingsItems } from '../config/navItems'
import { ChevronDownIcon } from '@chakra-ui/icons'

export default function MobileNav({ isOpen, onClose, active, onChange }) {
  const { t } = useI18n()
  const { colorMode } = useColorMode()
  const items = getMobileNavItems(t)
  const quickActions = getMobileQuickActions(t)
  const settingsItems = getMobileSettingsItems(t)

  const bgColor = colorMode === 'dark' ? 'rgba(17,25,40,0.95)' : 'rgba(255,255,255,0.95)'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'
  const mutedColor = colorMode === 'dark' ? 'gray.400' : 'gray.600'

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs" zIndex={1600}>
      <DrawerOverlay />
      <DrawerContent bg={bgColor} backdropFilter="blur(16px) saturate(110%)">
        <DrawerCloseButton color={textColor} />
        <DrawerHeader px={4} pt={4} pb={2}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            GlassMarkets Menu
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            Navigate the app
          </Text>
        </DrawerHeader>
        <DrawerBody px={4} pt={2}>
          <VStack spacing={3} align="stretch">
            {/* Main Navigation */}
            <Text fontSize="xs" color={mutedColor} fontWeight="medium" textTransform="uppercase">
              Navigation
            </Text>
            <VStack spacing={2} align="stretch">
              {items.map((item) => (
                <Button
                  key={item.key}
                  variant={active === item.key ? 'solid' : 'ghost'}
                  colorScheme={active === item.key ? 'blue' : 'gray'}
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontSize="sm"
                  justifyContent="flex-start"
                  leftIcon={item.icon ? <item.icon /> : undefined}
                  onClick={() => {
                    onChange(item.key)
                    onClose()
                  }}
                >
                  <HStack justify="space-between" w="100%">
                    <Text color={textColor}><Text color={textColor}>{item.label}</Text></Text>
                    {active === item.key && <Badge size="sm">Active</Badge>}
                  </HStack>
                </Button>
              ))}
            </VStack>

            <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} />

            {/* Quick Actions */}
            <Text fontSize="xs" color={mutedColor} fontWeight="medium" textTransform="uppercase">
              Quick Actions
            </Text>
            <VStack spacing={2} align="stretch">
              {quickActions.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontSize="sm"
                  justifyContent="flex-start"
                  leftIcon={item.icon ? <item.icon /> : undefined}
                  onClick={() => {
                    if (item.action === 'refresh') window.location.reload()
                    if (item.action === 'share') {
                      navigator.clipboard.writeText(window.location.href)
                      // Could add toast here
                    }
                    onClose()
                  }}
                >
                  <Text color={textColor}>{item.label}</Text>
                </Button>
              ))}
            </VStack>

            <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} />

            {/* Settings */}
            <Text fontSize="xs" color={mutedColor} fontWeight="medium" textTransform="uppercase">
              Settings
            </Text>
            <VStack spacing={2} align="stretch">
              {settingsItems.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontSize="sm"
                  justifyContent="flex-start"
                  leftIcon={item.icon ? <item.icon /> : undefined}
                  onClick={() => {
                    // Handle settings actions
                    onClose()
                  }}
                >
                  <Text color={textColor}>{item.label}</Text>
                </Button>
              ))}
            </VStack>

            <Box mt={4} p={3} bg="whiteAlpha.5" borderRadius="lg">
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} textAlign="center">
                Version 1.0.0
              </Text>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} textAlign="center" mt={1}>
                © 2024 GlassMarkets
              </Text>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
