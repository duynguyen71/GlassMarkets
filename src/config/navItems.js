import { RepeatIcon, SearchIcon, StarIcon, TimeIcon, ViewIcon, WarningIcon, UpDownIcon, InfoIcon, ChatIcon, CalendarIcon } from '@chakra-ui/icons'

export function getNavItems(t) {
  return [
    { key: 'total', label: t('menu.globalOverview'), icon: ViewIcon },
    { key: 'summary', label: t('menu.spotMarket'), icon: SearchIcon },
    { key: 'search', label: t('menu.coinSearch'), icon: InfoIcon },
    { key: 'favorites', label: t('menu.favorites'), icon: StarIcon },
    { key: 'news', label: t('menu.newsFeed'), icon: ChatIcon },
    { key: 'ai', label: t('menu.aiSector'), icon: RepeatIcon },
  ]
}
