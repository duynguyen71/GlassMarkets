import { Box, Grid, GridItem, Heading, HStack, Progress, Skeleton, Stat, StatLabel, StatNumber, Text } from '@chakra-ui/react'
import Glass from '../components/Glass'
import useGlobalSummary from '../hooks/useGlobalSummary'
import { formatNumber, formatUSD } from '../utils/number'
import { useI18n } from '../i18n'
import IconCircle from '../components/IconCircle'
import TokenLogo from '../components/TokenLogo'
import { SkeletonMarketCapCard, SkeletonSummaryCard } from '../components/SkeletonLoader'

function Card({ title, value, help, accent, gradient, icon, loading }) {
  return (
    <Glass p={0} hoverLift>
      {accent ? <Box h="2" bg={accent} borderTopRadius="2xl" /> : null}
      <Box p={4} position="relative" overflow="hidden" minH="150px">
        {gradient ? <Box position="absolute" inset={0} opacity={0.18} bgGradient={gradient} /> : null}
        <Box position="relative">
          {icon ? <Box position="absolute" top={2} right={3}>{icon}</Box> : null}
          <Stat>
            <StatLabel>
              <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                {title}
              </Skeleton>
            </StatLabel>
            <StatNumber fontWeight="extrabold">
              <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "120px" : "auto"}>
                {value}
              </Skeleton>
            </StatNumber>
            {help ? (
              <Box fontSize="sm" color="gray.500" mt={1} as="span">
                <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                  {help}
                </Skeleton>
              </Box>
            ) : null}
          </Stat>
        </Box>
      </Box>
    </Glass>
  )
}

export default function TotalSummaryView({ active = true }) {
  const { t } = useI18n()
  const { loading, fng, totalMcap, totalMcapChg, totalMcapChgPct, btcDom, ethDom, usdtDom, xrpDom, bnbDom, solDom, usdcDom, totalVolumeUsd, activeCryptos, markets, marketCapEth, marketCapBtc, upcomingICOs, ongoingICOs, endedICOs, updatedAt, spx, gold, top, defi, gas } = useGlobalSummary(active)
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
  const DefiIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></IconCircle>
  )
  const GasIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4v2c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4v-2zm-6 0H8c-1.1 0-2-.9-2-2V6h2v2c0 1.1.9 2 2 2zm4 0c1.1 0 2-.9 2-2V6h2v2c0 1.1-.9 2-2 2z"/></svg></IconCircle>
  )
  const StablecoinIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm2 2h12v4H6v-4z"/></svg></IconCircle>
  )
  const ICOIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11L12 2zm0 0l-5.5 9h11L12 2zm-2 7h4v2h-4V9z"/></svg></IconCircle>
  )
  const UpdateIcon = () => (
    <IconCircle><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.45 1.45C20.45 14.99 21 13.55 21 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.25 8.95C6.27 10.01 7.55 11 9 11v2H4v2h5v2c0 1.45.99 2.73 2.05 3.8l-1.45 1.45c-.83.45-1.79.7-2.8.7z"/></svg></IconCircle>
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

  // Show improved skeleton loading only when truly loading (no cached data)
  if (loading && !totalMcap && !fng?.value && !top?.btc?.price) {
    return (
      <Box>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <GridItem>
            <SkeletonMarketCapCard delay={0} />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.1} accentColor="orange.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.2} accentColor="purple.500" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.3} accentColor="purple.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.4} accentColor="cyan.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.5} accentColor="pink.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.6} accentColor="yellow.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.7} accentColor="blue.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.8} accentColor="teal.400" showProgress={true} />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={0.9} accentColor="cyan.400" />
          </GridItem>
          <GridItem>
            <SkeletonSummaryCard delay={1.0} accentColor="yellow.400" />
          </GridItem>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient="linear(to-br, teal.400, green.500)" borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "120px" : "auto"}>
                    Total Market Cap
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "140px" : "auto"}>
                      {formatUSD(totalMcap)}
                    </Skeleton>
                  </StatNumber>
                  <Text color={(typeof totalMcapChg === 'number' && totalMcapChg >= 0) ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                      {totalMcapChg != null ? `${totalMcapChg >= 0 ? '+' : ''}${formatUSD(Math.abs(totalMcapChg))} (${(totalMcapChgPct || 0).toFixed(2)}%)` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Box fontSize="sm" color="gray.500" mt={1} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "150px" : "auto"}>
                    All crypto, USD. 24h change
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><GlobeIcon /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Card title="Bitcoin Dominance" value={typeof btcDom === 'number' ? `${btcDom.toFixed(2)}%` : '-'} help="BTC share of total market cap" accent="orange.400" gradient="linear(to-br, orange.400, yellow.400)" icon={<PieIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="Altcoin Index" value={altDom != null ? `${altDom.toFixed(2)}%` : '-'} help="100% - BTC dominance" accent="purple.500" gradient="linear(to-br, pink.400, purple.600)" icon={<PieIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="ETH Dominance" value={typeof ethDom === 'number' ? `${ethDom.toFixed(2)}%` : '-'} help="ETH share of total market cap" accent="purple.400" gradient="linear(to-br, purple.400, indigo.500)" icon={<TokenLogo base="ETH" />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="24h Volume" value={formatUSD(totalVolumeUsd)} help="Total crypto volume, USD" accent="cyan.400" gradient="linear(to-br, cyan.400, teal.500)" icon={<WavesIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="Active Cryptos" value={formatNumber(activeCryptos)} help={`Markets: ${formatNumber(markets)}`} accent="pink.400" gradient="linear(to-br, pink.400, red.500)" icon={<GridIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient="linear(to-br, yellow.400, orange.400)" borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                    Bitcoin (BTC)
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "120px" : "auto"}>
                      {top?.btc?.price ? formatUSD(top.btc.price) : '-'}
                    </Skeleton>
                  </StatNumber>
                  <Text color={(top?.btc?.chgPct || 0) >= 0 ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                      {top?.btc?.chgPct != null ? `${top.btc.chgPct >= 0 ? '+' : ''}${(top.btc.chgPct || 0).toFixed(2)}%` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Box fontSize="sm" color="gray.500" mt={1} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "70px" : "auto"}>
                    24h change
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><TokenLogo base="BTC" /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient="linear(to-br, blue.400, cyan.400)" borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                    Ethereum (ETH)
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "120px" : "auto"}>
                      {top?.eth?.price ? formatUSD(top.eth.price) : '-'}
                    </Skeleton>
                  </StatNumber>
                  <Text color={(top?.eth?.chgPct || 0) >= 0 ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                      {top?.eth?.chgPct != null ? `${top.eth.chgPct >= 0 ? '+' : ''}${(top.eth.chgPct || 0).toFixed(2)}%` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Box fontSize="sm" color="gray.500" mt={1} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "70px" : "auto"}>
                    24h change
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><TokenLogo base="ETH" /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient={fgGradient} borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                    Fear & Greed
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "60px" : "auto"}>
                      {fng?.value != null ? String(fng.value) : '-'}
                    </Skeleton>
                  </StatNumber>
                  <Text color={(fng?.delta || 0) >= 0 ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "50px" : "auto"}>
                      {fng?.delta != null ? `${fng.delta >= 0 ? '+' : ''}${fng.delta}` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Skeleton isLoaded={!loading} mt={2} borderRadius="full">
                  <Progress mt={2} colorScheme={fgScheme} borderRadius="full" value={fearVal} max={100} height="2" />
                </Skeleton>
                <Box fontSize="sm" color="gray.500" mt={2} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "200px" : "auto"}>
                    {fng?.classification} • Scale 0 (Extreme Fear) — 100 (Extreme Greed)
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><GaugeIcon /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient="linear(to-br, cyan.400, blue.500)" borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                    S&P 500 (SPX)
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                      {spx?.last ? formatNumber(spx.last) : (loading ? 'Loading...' : '-')}
                    </Skeleton>
                  </StatNumber>
                  <Text color={spx?.chg >= 0 ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                      {spxOpen && spx?.chg != null ? `${spx.chg >= 0 ? '+' : ''}${spx.chg.toFixed(2)} (${(spx.chgPct || 0).toFixed(2)}%)` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Box fontSize="sm" color="gray.500" mt={1} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                    {spx?.fallback ? 'Market data' : spx?.source ? `Close (${spx.source})` : 'Loading...'}
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><LineIcon /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Glass p={0} hoverLift>
            <Box h="2" bgGradient="linear(to-br, yellow.400, orange.400)" borderTopRadius="2xl" />
            <Box p={4} position="relative" minH="150px">
              <Stat>
                <StatLabel>
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                    Gold (XAUUSD)
                  </Skeleton>
                </StatLabel>
                <HStack justify="space-between">
                  <StatNumber fontWeight="extrabold">
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "100px" : "auto"}>
                      {gold?.last ? formatNumber(gold.last) : (loading ? 'Loading...' : '-')}
                    </Skeleton>
                  </StatNumber>
                  <Text color={gold?.chg >= 0 ? 'green.300' : 'red.300'}>
                    <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                      {goldOpen && gold?.chg != null ? `${gold.chg >= 0 ? '+' : ''}${gold.chg.toFixed(2)} (${(gold.chgPct || 0).toFixed(2)}%)` : ''}
                    </Skeleton>
                  </Text>
                </HStack>
                <Box fontSize="sm" color="gray.500" mt={1} as="span">
                  <Skeleton isLoaded={!loading} display="inline-block" minW={loading ? "80px" : "auto"}>
                    {gold?.fallback ? 'Market data' : gold?.source ? `Spot price (${gold.source})` : 'Loading...'}
                  </Skeleton>
                </Box>
              </Stat>
              <Box position="absolute" top={2} right={3}><GoldIcon /></Box>
            </Box>
          </Glass>
        </GridItem>
        <GridItem>
          <Card title="DeFi TVL" value={defi?.totalTVL ? formatUSD(defi.totalTVL) : '-'} help={defi?.totalTVL ? `Total Value Locked in DeFi (${defi.chgPct >= 0 ? '+' : ''}${defi.chgPct.toFixed(2)}%)` : 'Loading DeFi data'} accent="purple.400" gradient="linear(to-br, purple.400, pink.500)" icon={<DefiIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="ETH Gas Price" value={gas?.standard ? `${gas.standard} Gwei` : '-'} help={gas?.fast && gas?.safe ? `Safe: ${gas.safe} | Fast: ${gas.fast} Gwei` : 'Loading gas data'} accent="blue.400" gradient="linear(to-br, blue.400, cyan.500)" icon={<GasIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="USDT Dominance" value={typeof usdtDom === 'number' ? `${usdtDom.toFixed(2)}%` : '-'} help="Tether share of total market cap" accent="green.400" gradient="linear(to-br, green.400, teal.400)" icon={<StablecoinIcon />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="XRP Dominance" value={typeof xrpDom === 'number' ? `${xrpDom.toFixed(2)}%` : '-'} help="Ripple share of total market cap" accent="black" gradient="linear(to-br, gray.400, black)" icon={<TokenLogo base="XRP" />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="SOL Dominance" value={typeof solDom === 'number' ? `${solDom.toFixed(2)}%` : '-'} help="Solana share of total market cap" accent="purple.400" gradient="linear(to-br, purple.400, purple.600)" icon={<TokenLogo base="SOL" />} loading={loading} />
        </GridItem>
        <GridItem>
          <Card title="Active ICOs" value={ongoingICOs || 0} help={`${upcomingICOs || 0} upcoming • ${endedICOs || 0} ended`} accent="yellow.400" gradient="linear(to-br, yellow.400, orange.500)" icon={<ICOIcon />} loading={loading} />
        </GridItem>
      </Grid>
      <Text mt={4} color="gray.400" fontSize="sm">Sources: CoinGecko (global), Alternative.me (Fear&Greed), Stooq (SPX/XAUUSD). Some sources may rate-limit or block cross-origin in certain networks.</Text>
    </Box>
  )
}
