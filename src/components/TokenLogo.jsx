import { Avatar, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

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

const CACHE_KEY = (sym) => `iconSrc:${sym}`
const CACHE_NONE_KEY = (sym) => `iconSrcNone:${sym}`
const NONE_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export default function TokenLogo({ base, size = 'sm', mr = 1 }) {
  const sym = norm(base)
  const candidates = useMemo(() => {
    if (!sym) return []
    const names = Array.from(new Set([sym, ALIAS[sym]]).values()).filter(Boolean)
    const urls = []
    for (const n of names) {
      // Use CDN sources with better CORS support for production
      // CoinGecko API proxy (free, no CORS issues)
      urls.push(`https://assets.coingecko.com/coins/images/1/small/${n}.png`)
      // jsdelivr CDN (reliable, good CORS)
      urls.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${n}.png`)
      urls.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/${n}.svg`)
      // Binance CDN (official)
      urls.push(`https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/${n.toUpperCase()}.png`)
    }
    return urls
  }, [sym])
  const [idx, setIdx] = useState(() => {
    if (!sym) return 0
    try {
      const none = JSON.parse(localStorage.getItem(CACHE_NONE_KEY(sym)) || 'null')
      if (none && Date.now() - none.ts < NONE_TTL_MS) return Number.MAX_SAFE_INTEGER // skip attempts
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY(sym)) || 'null')
      if (typeof cached?.i === 'number') return cached.i
    } catch {}
    return 0
  })
  const src = candidates[idx] || undefined
  const triedRef = useRef(new Set())

  // Probe the current candidate; on success cache it, on failure advance
  useEffect(() => {
    if (!sym || !candidates.length) return
    if (idx >= candidates.length) {
      // exhausted; cache none for a while
      try { localStorage.setItem(CACHE_NONE_KEY(sym), JSON.stringify({ ts: Date.now() })) } catch {}
      return
    }
    const url = candidates[idx]
    if (triedRef.current.has(url)) return
    triedRef.current.add(url)
    const img = new Image()
    img.onload = () => {
      try { localStorage.setItem(CACHE_KEY(sym), JSON.stringify({ i: idx, url })) } catch {}
    }
    img.onerror = () => {
      // advance to next
      setIdx((i) => i + 1)
    }
    img.src = url
    // cleanup
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [sym, candidates, idx])

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
      crossOrigin="anonymous"
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
    />
  )
}
