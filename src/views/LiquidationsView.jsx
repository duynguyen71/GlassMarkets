import { Badge, Box, Button, Heading, HStack, Input, Select, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react'
import Glass from '../components/Glass'
import { useEffect, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { friendlySymbol } from '../utils/symbol'
import TokenLogo from '../components/TokenLogo'
import useLiquidations from '../hooks/useLiquidations'

export default function LiquidationsView({ active = true }) {
  const [lookback, setLookback] = useLocalStorage('pref:liqLookback', 30)
  const [query, setQuery] = useState('')
  const [source, setSource] = useLocalStorage('pref:liqSource', 'Binance')
  const { events, summary } = useLiquidations({ source, lookbackMin: lookback, pollMs: 15000, enabled: active })
  const thBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.200')
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (events || []).filter((e) => !q || e.instId.toLowerCase().includes(q))
  }, [events, query])

  // persist lookback on change
  useEffect(() => {
    try { localStorage.setItem('pref:liqLookback', String(lookback)) } catch {}
  }, [lookback])

  return (
    <Box>
      <Heading size="md" mb={2}>Liquidations Feed</Heading>
      <Glass p={3} mb={2}>
        <HStack spacing={4} justify="space-between">
          <HStack spacing={4}>
            <StatPill label="Events" value={summary.total} />
            <StatPill label="Long" value={summary.longs} color="green" />
            <StatPill label="Short" value={summary.shorts} color="red" />
          </HStack>
          <HStack>
            <Badge variant="subtle">Source</Badge>
            <Button size="sm" variant={source==='Binance' ? 'solid' : 'outline'} onClick={()=>setSource('Binance')}>Binance</Button>
            <Button size="sm" variant={source==='OKX' ? 'solid' : 'outline'} onClick={()=>setSource('OKX')}>OKX</Button>
            <Badge variant="subtle">Window</Badge>
            <Select size="sm" value={lookback} onChange={(e) => setLookback(Number(e.target.value))} width="auto">
              {[15, 30, 60, 120].map((m) => (
                <option key={m} value={m}>{m}m</option>
              ))}
            </Select>
          </HStack>
        </HStack>
      </Glass>

      <Input placeholder="Search instrument (e.g. BTC)" value={query} onChange={(e) => setQuery(e.target.value)} mb={2} variant="filled" bg="whiteAlpha.200" _hover={{ bg: 'whiteAlpha.300' }} _focus={{ bg: 'whiteAlpha.300' }} />
      <Glass p={2}>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr bg={thBg} backdropFilter="blur(6px)">
                <Th>Symbol</Th>
                <Th>Side</Th>
                <Th isNumeric>Size</Th>
                <Th isNumeric>Price</Th>
                <Th isNumeric>Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((e, i) => (
                <Tr key={`${e.instId}-${e.ts}-${i}`} _hover={{ bg: rowHover }}>
                  <Td><HStack><TokenLogo base={e.base} /><Badge>{friendlySymbol(e.instId)}</Badge></HStack></Td>
                  <Td>
                    <Badge colorScheme={e.side === 'long' ? 'green' : 'red'}>{e.side || '-'}</Badge>
                  </Td>
                  <Td isNumeric>{isFinite(e.sz) ? e.sz : '-'}</Td>
                  <Td isNumeric>{isFinite(e.px) ? e.px : '-'}</Td>
                  <Td isNumeric>{new Date(e.ts).toLocaleTimeString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Glass>
    </Box>
  )
}

function StatPill({ label, value, color }) {
  return (
    <HStack>
      <Badge colorScheme={color} variant="subtle">{label}</Badge>
      <Badge>{value}</Badge>
    </HStack>
  )
}
