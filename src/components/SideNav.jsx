import { Box, Button, VStack } from '@chakra-ui/react'
import { ViewIcon, SearchIcon, StarIcon, TimeIcon, RepeatIcon, WarningIcon } from '@chakra-ui/icons'
import Glass from './Glass'
import { useI18n } from '../i18n'

export default function SideNav({ active, onChange }) {
  const { t } = useI18n()
  const items = [
    { key: 'total', label: t('menu.globalOverview'), icon: ViewIcon },
    { key: 'summary', label: t('menu.spotMarket'), icon: SearchIcon },
    { key: 'ai', label: t('menu.aiSector'), icon: StarIcon },
    { key: 'oi', label: t('menu.openInterest'), icon: TimeIcon },
    { key: 'futures', label: t('menu.futuresMarket'), icon: RepeatIcon },
    { key: 'surprise', label: t('menu.volumeSignals'), icon: ViewIcon },
    { key: 'liquidations', label: t('menu.liquidationsFeed'), icon: WarningIcon },
  ]
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
