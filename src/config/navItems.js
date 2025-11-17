import {
  RepeatIcon,
  SearchIcon,
  StarIcon,
  TimeIcon,
  ViewIcon,
  WarningIcon,
  UpDownIcon,
  InfoIcon,
  ChatIcon,
  CalendarIcon,
  SettingsIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EmailIcon,
  EditIcon,
  LockIcon,
  MoonIcon,
  SunIcon,
  PlusSquareIcon,
  BellIcon,
  QuestionOutlineIcon
} from '@chakra-ui/icons'

export function getNavItems(t) {
  return [
    { key: 'total', label: t('menu.globalOverview'), icon: ViewIcon },
    { key: 'charts', label: t('menu.charts'), icon: UpDownIcon },
    { key: 'summary', label: t('menu.spotMarket'), icon: SearchIcon },
    { key: 'search', label: t('menu.coinSearch'), icon: InfoIcon },
    { key: 'favorites', label: t('menu.favorites'), icon: StarIcon },
    { key: 'portfolio', label: t('menu.portfolio'), icon: PlusSquareIcon },
    { key: 'news', label: t('menu.newsFeed'), icon: ChatIcon },
    { key: 'ai', label: t('menu.aiSector'), icon: RepeatIcon },
  ]
}

export function getQuickActions(t) {
  return [
    { key: 'refresh', label: t('menu.refresh'), icon: RepeatIcon, action: 'refresh' },
    { key: 'export', label: t('menu.export'), icon: DownloadIcon, action: 'export' },
    { key: 'share', label: t('menu.share'), icon: EmailIcon, action: 'share' },
    { key: 'fullscreen', label: t('menu.fullscreen'), icon: ExternalLinkIcon, action: 'fullscreen' },
  ]
}

export function getMobileNavItems(t) {
  return [
    { key: 'total', label: t('menu.globalOverview'), icon: ViewIcon },
    { key: 'summary', label: t('menu.spotMarket'), icon: SearchIcon },
    { key: 'search', label: t('menu.coinSearch'), icon: InfoIcon },
    { key: 'favorites', label: t('menu.favorites'), icon: StarIcon },
    { key: 'ai', label: t('menu.aiSector'), icon: RepeatIcon },
  ]
}

export function getMobileQuickActions(t) {
  return [
    { key: 'refresh', label: t('menu.refresh'), icon: RepeatIcon, action: 'refresh' },
    { key: 'share', label: t('menu.share'), icon: EmailIcon, action: 'share' },
  ]
}

export function getMobileSettingsItems(t) {
  return [
    { key: 'theme', label: t('menu.theme'), icon: MoonIcon },
    { key: 'help', label: t('menu.help'), icon: QuestionOutlineIcon },
    { key: 'contact', label: t('menu.contact'), icon: EmailIcon },
  ]
}

export function getSettingsItems(t) {
  return [
    { key: 'preferences', label: t('menu.preferences'), icon: SettingsIcon },
    { key: 'notifications', label: t('menu.notifications'), icon: BellIcon },
    { key: 'privacy', label: t('menu.privacy'), icon: LockIcon },
    { key: 'theme', label: t('menu.theme'), icon: MoonIcon },
    { key: 'help', label: t('menu.help'), icon: QuestionOutlineIcon },
    { key: 'contact', label: t('menu.contact'), icon: EmailIcon },
  ]
}
