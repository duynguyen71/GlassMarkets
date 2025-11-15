import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, SimpleGrid, Button, Box, HStack, Text } from '@chakra-ui/react'
import Glass from './Glass'
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
        <DrawerHeader px={4} pt={4} pb={0}>
          <Glass p={3} borderRadius="2xl">
            <HStack spacing={3}>
              <Box fontWeight="semibold">GlassMarkets</Box>
              <Text fontSize="sm" color="gray.500">{t('menu.globalOverview')}</Text>
            </HStack>
          </Glass>
        </DrawerHeader>
        <DrawerBody px={4} pt={4}>
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
            {items.map((item) => (
              <Button
                key={item.key}
                justifyContent="flex-start"
                leftIcon={item.icon ? <item.icon /> : undefined}
                variant={active === item.key ? 'solid' : 'ghost'}
                colorScheme={active === item.key ? 'blue' : 'gray'}
                borderRadius="xl"
                px={3}
                py={4}
                fontSize="sm"
                onClick={() => {
                  onChange(item.key)
                  onClose()
                }}
              >
                {item.label}
              </Button>
            ))}
          </SimpleGrid>
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
