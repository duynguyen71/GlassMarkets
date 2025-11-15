import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Button, Box, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import { getNavItems } from '../config/navItems'

export default function MobileNav({ isOpen, onClose, active, onChange }) {
  const { t } = useI18n()
  const items = getNavItems(t)

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="rgba(17,25,40,0.85)" backdropFilter="blur(16px) saturate(110%)">
        <DrawerCloseButton />
        <DrawerHeader px={4} pt={4} pb={2}>
          <Text fontSize="sm" fontWeight="semibold">
            {t('menu.globalOverview')}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {t('menu.spotMarket')}
          </Text>
        </DrawerHeader>
        <DrawerBody px={4} pt={2}>
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
                {item.label}
              </Button>
            ))}
          </VStack>
          <Box mt={4}>
            <Text fontSize="xs" color="gray.400">
              {t('favorites.empty')}
            </Text>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
