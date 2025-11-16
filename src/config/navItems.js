import { RepeatIcon, SearchIcon, StarIcon, TimeIcon, ViewIcon, WarningIcon, UpDownIcon, InfoIcon } from '@chakra-ui/icons'

export function getNavItems(t) {
  return [
    { key: 'total', label: t('menu.globalOverview'), icon: ViewIcon },
    { key: 'summary', label: t('menu.spotMarket'), icon: SearchIcon },
    { key: 'search', label: t('menu.coinSearch'), icon: InfoIcon },
    { key: 'favorites', label: t('menu.favorites'), icon: StarIcon },
    { key: 'ai', label: t('menu.aiSector'), icon: RepeatIcon },
    { key: 'oi', label: t('menu.openInterest'), icon: TimeIcon },
    { key: 'surprise', label: t('menu.volumeSignals'), icon: ViewIcon },
    { key: 'liquidations', label: t('menu.liquidationsFeed'), icon: WarningIcon },
  ]
}
