import { Avatar, useColorModeValue } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

const ALIAS = {
  wbtc: 'btc', weth: 'eth', steth: 'eth', beth: 'eth', seth: 'eth', wsteth: 'eth',
  wbnb: 'bnb',
  usdt: 'usdt', usdc: 'usdc', busd: 'busd', dai: 'dai', tusd: 'tusd', fdusd: 'fdusd',
  pepe: 'pepe', shib: 'shib', doge: 'doge', grt: 'grt', link: 'link', near: 'near', sol: 'sol', ada: 'ada', xrp: 'xrp', dot: 'dot', atom: 'atom', avax: 'avax', arkm: 'arkm', ar: 'ar', tao: 'tao',
  '1000sats': 'sats', sats: 'sats',
}

function stripLeverageSuffix(s) {
  // remove common leverage suffixes like UP/DOWN, BULL/BEAR, 3L/3S etc.
  return s
    .replace(/(up|down|bull|bear)$/i, '')
    .replace(/\d+[ls]$/i, '')
}

function norm(sym) {
  if (!sym) return ''
  const s = String(sym).toLowerCase()
  const alnum = s.replace(/[^a-z0-9]/g, '')
  const base = stripLeverageSuffix(alnum)
  return ALIAS[base] || base
}

export default function TokenLogo({ base, size = 'sm', mr = 1 }) {
  const sym = norm(base)
  const candidates = useMemo(() => {
    if (!sym) return []
    const names = Array.from(new Set([sym, ALIAS[sym]]).values()).filter(Boolean)
    const urls = []
    for (const n of names) {
      // Binance official currency logos
      urls.push(`https://assets.binance.com/image/currency/logo/${n.toUpperCase()}.png`)
      urls.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${n}.png`)
      urls.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/${n}.svg`)
      urls.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/black/${n}.png`)
    }
    return urls
  }, [sym])

  const [idx, setIdx] = useState(0)
  const src = candidates[idx] || undefined

  const fallbackColor = useColorModeValue('gray.800', 'white')
  if (!base) return <Avatar name={''} size={size} mr={mr} bg="blackAlpha.300" color={fallbackColor} />

  return (
    <Avatar
      name={base}
      src={src}
      size={size}
      mr={mr}
      bg="blackAlpha.300"
      color={fallbackColor}
      fontWeight="bold"
      borderWidth="1px"
      borderColor="whiteAlpha.300"
      onError={() => setIdx((i) => i + 1)}
    />
  )
}
