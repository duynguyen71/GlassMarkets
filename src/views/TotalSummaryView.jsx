import { Box, Grid, GridItem, Heading, HStack, Progress, Skeleton, Stat, StatHelpText, StatLabel, StatNumber, Text } from '@chakra-ui/react'
import Glass from '../components/Glass'
import useGlobalSummary from '../hooks/useGlobalSummary'
import { formatNumber, formatUSD } from '../utils/number'
import { useI18n } from '../i18n'
import IconCircle from '../components/IconCircle'
import TokenLogo from '../components/TokenLogo'

function Card({ title, value, help, accent, gradient, icon }) {
  return (
    <Glass p={0} hoverLift>
      {accent ? <Box h="2" bg={accent} borderTopRadius="2xl" /> : null}
      <Box p={4} position="relative" overflow="hidden">
        {gradient ? <Box position="absolute" inset={0} opacity={0.18} bgGradient={gradient} /> : null}
        <Box position="relative">
          {icon ? <Box position="absolute" top={2} right={3}>{icon}</Box> : null}
          <Stat>
            <StatLabel>{title}</StatLabel>
            <StatNumber fontWeight="extrabold">{value}</StatNumber>
            {help ? <StatHelpText>{help}</StatHelpText> : null}
          </Stat>
        </Box>
      </Box>
    </Glass>
  )
}

export default function TotalSummaryView() {
  const { t } = useI18n()
  const { loading, fng, totalMcap, totalMcapChg, totalMcapChgPct, btcDom, ethDom, totalVolumeUsd, activeCryptos, markets, spx, gold, top } = useGlobalSummary()
  const altDom = typeof btcDom === 'number' ? Math.max(0, 100 - btcDom) : null
  const fearVal = Number(fng?.value || 0)
  const fgScheme = fearVal >= 70 ? 'green' : fearVal >= 55 ? 'teal' : fearVal >= 45 ? 'yellow' : fearVal >= 25 ? 'orange' : 'red'
  const fgGradient = fearVal >= 50 ? 'linear(to-br, green.400, teal.500)' : 'linear(to-br, orange.400, red.500)'

  const GlobeIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20Zm7.93 9h-3.11a15.9 15.9 0 00-1.2-5.02A8.03 8.03 0 0119.93 11ZM12 4c.94 1.25 1.86 3.44 2.2 7H9.8c.34-3.56 1.26-5.75 2.2-7ZM6.38 7.0A15.9 15.9 0 005.18 11H2.07a8.03 8.03 0 014.31-4ZM4.07 13h3.11a15.9 15.9 0 001.2 5.02A8.03 8.03 0 014.07 13Zm7.93 7c-.94-1.25-1.86-3.44-2.2-7h4.4c-.34 3.56-1.26 5.75-2.2 7Zm3.62-1.0A15.9 15.9 0 0018.82 13h3.11a8.03 8.03 0 01-4.31 4Z"/></svg></IconCircle>
  )
  const PieIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a1 1 0 00-1 1v8H2a1 1 0 00-1 1 10 10 0 1010-10Zm2 0a9 9 0 019 9 1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1Z"/></svg></IconCircle>
  )
  const WavesIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2v2c-2 0-2-2-4-2s-2 2-4 2-2-2-4-2-2 2-4 2V7Zm0 6c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2v2c-2 0-2-2-4-2s-2 2-4 2-2-2-4-2-2 2-4 2v-2Z"/></svg></IconCircle>
  )
  const GridIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"/></svg></IconCircle>
  )
  const GaugeIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a9 9 0 019 9h-2a7 7 0 10-14 0H3a9 9 0 019-9Zm-1 9a1 1 0 102 0 1 1 0 10-2 0Zm5.66-2.24-2.83 2.83-1.41-1.41 2.83-2.83a1 1 0 111.41 1.41Z"/></svg></IconCircle>
  )
  const LineIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 17l5-6 4 3 5-7 2 1-6 9-4-3-4 5-2-2Z"/></svg></IconCircle>
  )
  const GoldIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 10l4-6 4 6H8Zm-5 8l3-6h12l3 6H3Z"/></svg></IconCircle>
  )

  // Helpers: determine if exchanges are trading now (ET-based heuristic)
  const getETParts = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date())
      const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
      const wd = (map.weekday || 'Sun').slice(0, 3)
      const dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd] ?? 0
      const hour = parseInt(map.hour || '0', 10)
      const minute = parseInt(map.minute || '0', 10)
      return { dayIdx, minutes: hour * 60 + minute }
    } catch {
      return { dayIdx: new Date().getDay(), minutes: new Date().getHours() * 60 + new Date().getMinutes() }
    }
  }

  const { dayIdx, minutes } = getETParts()
  const isWeekday = dayIdx >= 1 && dayIdx <= 5
  // NYSE regular session: 9:30–16:00 ET
  const spxOpen = isWeekday && minutes >= (9 * 60 + 30) && minutes <= (16 * 60)
  // Gold spot (approx): 24x5; hide changes on weekend (Sat) and before Sunday 18:00 ET
  const goldOpen = (dayIdx >= 1 && dayIdx <= 5) || (dayIdx === 0 && minutes >= (18 * 60))

  return (
    <Box>
      <Heading size="md" mb={3}>{t('total.title') || 'Global Market Summary'}</Heading>
      <Skeleton isLoaded={!loading} borderRadius="xl">
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient="linear(to-br, teal.400, green.500)" borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>Total Market Cap</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{formatUSD(totalMcap)}</StatNumber>
                    <Text color={(typeof totalMcapChg === 'number' && totalMcapChg >= 0) ? 'green.300' : 'red.300'}>
                      {totalMcapChg != null ? `${totalMcapChg >= 0 ? '+' : ''}${formatUSD(Math.abs(totalMcapChg))} (${(totalMcapChgPct || 0).toFixed(2)}%)` : ''}
                    </Text>
                  </HStack>
                  <StatHelpText>All crypto, USD. 24h change</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><GlobeIcon /></Box>
              </Box>
            </Glass>
          </GridItem>
          <GridItem>
            <Card title="Bitcoin Dominance" value={typeof btcDom === 'number' ? `${btcDom.toFixed(2)}%` : '-'} help="BTC share of total market cap" accent="orange.400" gradient="linear(to-br, orange.400, yellow.400)" icon={<PieIcon />} />
          </GridItem>
          <GridItem>
            <Card title="Altcoin Index" value={altDom != null ? `${altDom.toFixed(2)}%` : '-'} help="100% - BTC dominance" accent="purple.500" gradient="linear(to-br, pink.400, purple.600)" icon={<PieIcon />} />
          </GridItem>
          <GridItem>
            <Card title="ETH Dominance" value={typeof ethDom === 'number' ? `${ethDom.toFixed(2)}%` : '-'} help="ETH share of total market cap" accent="purple.400" gradient="linear(to-br, purple.400, indigo.500)" icon={<TokenLogo base="ETH" />} />
          </GridItem>
          <GridItem>
            <Card title="24h Volume" value={formatUSD(totalVolumeUsd)} help="Total crypto volume, USD" accent="cyan.400" gradient="linear(to-br, cyan.400, teal.500)" icon={<WavesIcon />} />
          </GridItem>
          <GridItem>
            <Card title="Active Cryptos" value={formatNumber(activeCryptos)} help={`Markets: ${formatNumber(markets)}`} accent="pink.400" gradient="linear(to-br, pink.400, red.500)" icon={<GridIcon />} />
          </GridItem>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient="linear(to-br, yellow.400, orange.400)" borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>Bitcoin (BTC)</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{top?.btc?.price ? formatUSD(top.btc.price) : '-'}</StatNumber>
                    <Text color={(top?.btc?.chgPct || 0) >= 0 ? 'green.300' : 'red.300'}>
                      {top?.btc?.chgPct != null ? `${top.btc.chgPct >= 0 ? '+' : ''}${(top.btc.chgPct || 0).toFixed(2)}%` : ''}
                    </Text>
                  </HStack>
                  <StatHelpText>24h change</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><TokenLogo base="BTC" /></Box>
              </Box>
            </Glass>
          </GridItem>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient="linear(to-br, blue.400, cyan.400)" borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>Ethereum (ETH)</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{top?.eth?.price ? formatUSD(top.eth.price) : '-'}</StatNumber>
                    <Text color={(top?.eth?.chgPct || 0) >= 0 ? 'green.300' : 'red.300'}>
                      {top?.eth?.chgPct != null ? `${top.eth.chgPct >= 0 ? '+' : ''}${(top.eth.chgPct || 0).toFixed(2)}%` : ''}
                    </Text>
                  </HStack>
                  <StatHelpText>24h change</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><TokenLogo base="ETH" /></Box>
              </Box>
            </Glass>
          </GridItem>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient={fgGradient} borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>Fear & Greed</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{fng?.value != null ? String(fng.value) : '-'}</StatNumber>
                    <Text color={(fng?.delta || 0) >= 0 ? 'green.300' : 'red.300'}>{fng?.delta != null ? `${fng.delta >= 0 ? '+' : ''}${fng.delta}` : ''}</Text>
                  </HStack>
                  <Progress mt={2} colorScheme={fgScheme} borderRadius="full" value={fearVal} max={100} height="2" />
                  <StatHelpText mt={2}>{fng?.classification} • Scale 0 (Extreme Fear) — 100 (Extreme Greed)</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><GaugeIcon /></Box>
              </Box>
            </Glass>
          </GridItem>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient="linear(to-br, cyan.400, blue.500)" borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>S&P 500 (SPX)</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{spx?.last ? formatNumber(spx.last) : '-'}</StatNumber>
                    <Text color={spx?.chg >= 0 ? 'green.300' : 'red.300'}>
                      {spxOpen && spx?.chg != null ? `${spx.chg >= 0 ? '+' : ''}${spx.chg.toFixed(2)} (${(spx.chgPct || 0).toFixed(2)}%)` : ''}
                    </Text>
                  </HStack>
                  <StatHelpText>Close (Stooq)</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><LineIcon /></Box>
              </Box>
            </Glass>
          </GridItem>
          <GridItem>
            <Glass p={0} hoverLift>
              <Box h="2" bgGradient="linear(to-br, yellow.400, orange.400)" borderTopRadius="2xl" />
              <Box p={4}>
                <Stat>
                  <StatLabel>Gold (XAUUSD)</StatLabel>
                  <HStack justify="space-between">
                    <StatNumber fontWeight="extrabold">{gold?.last ? formatNumber(gold.last) : '-'}</StatNumber>
                    <Text color={gold?.chg >= 0 ? 'green.300' : 'red.300'}>
                      {goldOpen && gold?.chg != null ? `${gold.chg >= 0 ? '+' : ''}${gold.chg.toFixed(2)} (${(gold.chgPct || 0).toFixed(2)}%)` : ''}
                    </Text>
                  </HStack>
                  <StatHelpText>Close (Stooq)</StatHelpText>
                </Stat>
                <Box position="absolute" top={2} right={3}><GoldIcon /></Box>
              </Box>
            </Glass>
          </GridItem>
        </Grid>
      </Skeleton>
      <Text mt={4} color="gray.400" fontSize="sm">Sources: CoinGecko (global), Alternative.me (Fear&Greed), Stooq (SPX/XAUUSD). Some sources may rate-limit or block cross-origin in certain networks.</Text>
    </Box>
  )
}
