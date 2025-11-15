import { Box, Button, VStack } from '@chakra-ui/react'
import Glass from './Glass'
import { useI18n } from '../i18n'
import { getNavItems } from '../config/navItems'

export default function SideNav({ active, onChange }) {
  const { t } = useI18n()
  const items = getNavItems(t)
  return (
    <Glass p={2} position="sticky" top={16} overflow="hidden">
      <VStack align="stretch" spacing={2}>
        {items.map((it) => (
          <Button
            key={it.key}
            onClick={() => onChange(it.key)}
            variant={active === it.key ? 'solid' : 'ghost'}
            justifyContent="flex-start"
            leftIcon={it.icon ? <it.icon /> : undefined}
          >
            {it.label}
          </Button>
        ))}
      </VStack>
    </Glass>
  )
}
