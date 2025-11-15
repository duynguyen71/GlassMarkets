import { Badge, Box, Flex, Skeleton, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react'
import { formatNumber, formatPct, formatUSD } from '../utils/number'
import Glass from './Glass'
import { useI18n } from '../i18n'

export default function SummaryBar({ summary, loading }) {
  const { t } = useI18n()
  const { totalPairs, totalQuoteVolume, advancers, decliners, avgChangePct } = summary || {}
  return (
    <Flex gap={4} flexWrap="wrap">
      <CardStat label={t('summary.pairsUsdt')} value={formatNumber(totalPairs)} help={t('summary.tracked')} loaded={!loading && totalPairs != null} />
      <CardStat label={t('summary.volumeQuote24h')} value={formatUSD(totalQuoteVolume)} help={t('summary.sumUsdtPairs')} loaded={!loading && totalQuoteVolume != null} />
      <CardStat label={t('summary.advancers')} value={formatNumber(advancers)} help={<Badge colorScheme="green">Up</Badge>} loaded={!loading && advancers != null} />
      <CardStat label={t('summary.decliners')} value={formatNumber(decliners)} help={<Badge colorScheme="red">Down</Badge>} loaded={!loading && decliners != null} />
      <CardStat label={t('summary.avgChange')} value={formatPct(avgChangePct)} help={t('summary.acrossPairs')} loaded={!loading && avgChangePct != null} />
    </Flex>
  )
}

function CardStat({ label, value, help, loaded }) {
  return (
    <Glass flex="1 1 220px" p={4} hoverLift>
      <Skeleton isLoaded={loaded} borderRadius="lg">
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber fontWeight="extrabold">{value}</StatNumber>
          <StatHelpText>{help}</StatHelpText>
        </Stat>
      </Skeleton>
    </Glass>
  )
}
