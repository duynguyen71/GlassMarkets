import { useEffect, useState } from 'react'

async function fetchJSON(url) {
  const r = await fetch(url, {
    cache: 'no-cache',
    mode: 'cors',
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} - ${r.statusText}`);
  return r.json()
}

async function fetchText(url) {
  const r = await fetch(url, {
    cache: 'no-cache',
    mode: 'cors',
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} - ${r.statusText}`);
  return r.text()
}

const PROXY_BASE = import.meta?.env?.VITE_PROXY_BASE || ''
const isDev = !!import.meta?.env?.DEV
const STOOQ_PROXY_BASE = import.meta?.env?.VITE_STOOQ_PROXY || 'https://cold-silence-68b3.khanhduy-dev-bt.workers.dev'

function cgUrl(path) {
  if (isDev) return `/_cg${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/cg${path}`
  return `https://api.coingecko.com${path}`
}
function fngUrl(path) {
  if (isDev) return `/_fng${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/fng${path}`
  return `https://api.alternative.me${path}`
}
function stooqUrl(path) {
  if (isDev) return `/_stooq${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/stooq${path}`
  return `https://stooq.com${path}`
}

function buildStooqProxyPath(path) {
  if (!STOOQ_PROXY_BASE) {
    return null
  }
  const base = STOOQ_PROXY_BASE.endsWith('/') ? STOOQ_PROXY_BASE : `${STOOQ_PROXY_BASE}/`
  return new URL(`stooq${path}`, base).toString()
}

async function fetchStooq(path) {
  if (isDev || PROXY_BASE) {
    return fetchText(stooqUrl(path))
  }
  const proxyUrl = buildStooqProxyPath(path)
  if (proxyUrl) {
    return fetchText(proxyUrl)
  }
  const targetUrl = `https://stooq.com${path}`
  return fetchText(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
}

// Helper function to add timeout to fetch
function fetchWithTimeout(url, options = {}, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

async function getFearGreed() {
  try {
    const j = await fetchJSON(fngUrl('/fng/?limit=2&format=json'))
    const list = j?.data || []
    const latest = list[0]
    const prev = list[1]
    const value = Number(latest?.value || 0)
    const prevValue = Number(prev?.value || 0)
    const delta = Number.isFinite(prevValue) ? value - prevValue : null
    return { value, classification: latest?.value_classification || '-', prev: prevValue, delta }
  } catch (e) {
    console.warn('Fear & Greed API error:', e.message)
    return { error: String(e) }
  }
}

async function getCoingeckoGlobal() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const j = await fetchJSON(cgUrl('/api/v3/global'))
    clearTimeout(timeoutId)

    const g = j?.data || {}
    const totalMcap = Number(g.total_market_cap?.usd || 0)
    const btcDom = Number(g.market_cap_percentage?.btc || 0)
    const ethDom = Number(g.market_cap_percentage?.eth || 0)
    const totalVolumeUsd = Number(g.total_volume?.usd || 0)
    const activeCryptos = Number(g.active_cryptocurrencies || 0)
    const markets = Number(g.markets || 0)
    const chgPct = Number(g.market_cap_change_percentage_24h_usd || 0)
    // previous = current / (1 + chgPct/100)
    const prevMcap = chgPct ? (totalMcap / (1 + chgPct / 100)) : null
    const chg = prevMcap != null ? (totalMcap - prevMcap) : null
    return { totalMcap, btcDom, ethDom, totalVolumeUsd, activeCryptos, markets, totalMcapChg: chg, totalMcapChgPct: chgPct }
  } catch (e) {
    console.warn('CoinGecko Global API error:', e.message)
    // Return cached data on rate limit
    if (e.message.includes('429')) {
      return { error: 'Rate limited - using cached data' }
    }
    return { error: String(e) }
  }
}

async function getTopPrices() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const j = await fetchJSON(cgUrl('/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'))
    clearTimeout(timeoutId)

    const btc = j?.bitcoin || {}
    const eth = j?.ethereum || {}
    return {
      btc: { price: Number(btc.usd || 0), chgPct: Number(btc.usd_24h_change || 0) },
      eth: { price: Number(eth.usd || 0), chgPct: Number(eth.usd_24h_change || 0) },
    }
  } catch (e) {
    console.warn('CoinGecko Prices API error:', e.message)
    // Return cached data on rate limit
    if (e.message.includes('429')) {
      return { error: 'Rate limited - using cached data' }
    }
    return { error: String(e) }
  }
}

// Stooq CSV helpers (simple, public). Example: https://stooq.com/q/l/?s=^spx&i=d
function parseStooqCSV(csv) {
  // symbol,date,time,open,high,low,close,volume
  const lines = String(csv).trim().split(/\r?\n/)
  if (lines.length < 2) return null
  const parts = lines[1].split(',')
  if (parts.length < 8) return null
  const close = Number(parts[6])
  return { close }
}

function parseStooqDaily(csv) {
  // returns { last, prev } if possible
  const lines = String(csv).trim().split(/\r?\n/)
  if (lines.length < 3) return null // header + at least 2 data rows
  const rows = lines.slice(1) // drop header
  const values = rows
    .map((ln) => Number(ln.split(',')[6]))
    .filter((v) => Number.isFinite(v))
  if (values.length < 2) return null
  const last = values[values.length - 1]
  const prev = values[values.length - 2]
  return { last, prev }
}

async function getSP500() {
  try {
    // daily history to compute change; ^ encoded as %5E
    const t = await fetchStooq('/q/d/l/?s=%5Espx&i=d')
    const r = parseStooqDaily(t)
    if (!r) return { last: null, unavailable: true }
    const chg = r.last - r.prev
    const chgPct = r.prev ? (chg / r.prev) * 100 : 0
    return { last: r.last, chg, chgPct }
  } catch (e) {
    console.warn('S&P 500 data unavailable (Stooq CORS):', e.message)
    return { last: null, unavailable: true }
  }
}

async function getGold() {
  try {
    const t = await fetchStooq('/q/d/l/?s=xauusd&i=d')
    const r = parseStooqDaily(t)
    if (!r) return { last: null, unavailable: true }
    const chg = r.last - r.prev
    const chgPct = r.prev ? (chg / r.prev) * 100 : 0
    return { last: r.last, chg, chgPct }
  } catch (e) {
    console.warn('Gold data unavailable (Stooq CORS):', e.message)
    return { last: null, unavailable: true }
  }
}

export default function useGlobalSummary(enabled = true) {
  // seed with cache when available to improve perceived performance and handle mobile limitations
  let cached = null
  let cacheTimestamp = null
  try {
    const cacheData = localStorage.getItem('gs:cache')
    const cacheTimeData = localStorage.getItem('gs:cache_time')
    if (cacheData) {
      cached = JSON.parse(cacheData)
      cacheTimestamp = cacheTimeData ? parseInt(cacheTimeData) : null
    }
  } catch {}

  const [state, setState] = useState(() => {
    if (cached && cacheTimestamp) {
      const age = Date.now() - cacheTimestamp
      // Use cache if it's less than 4 minutes old (to avoid 5min refresh conflicts)
      const isFresh = age < 4 * 60 * 1000
      return { ...cached, loading: !isFresh }
    }
    return { loading: true }
  })

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true }))

      try {
        // Check if we have fresh cache to avoid unnecessary API calls
        const now = Date.now()
        const currentCacheTime = localStorage.getItem('gs:cache_time')
        const cacheAge = currentCacheTime ? now - parseInt(currentCacheTime) : Infinity

        // If cache is fresh (< 2 min), use it and only refresh in background
        const useCache = cacheAge < 2 * 60 * 1000
        if (useCache && cached) {
          setState(prev => ({ ...prev, loading: false }))
        }

        // Load critical data first with delay to avoid rate limiting
        const [fng] = await Promise.all([
          getFearGreed().catch(e => ({ error: String(e) }))
        ])

        if (cancelled) return

        // Add delay before CoinGecko calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const [cg, top] = await Promise.all([
          getCoingeckoGlobal().catch(e => ({ error: String(e) })),
          getTopPrices().catch(e => ({ error: String(e) }))
        ])

        if (cancelled) return

        // Update with critical market data
        const criticalData = {
          fng,
          totalMcap: cg.totalMcap,
          totalMcapChg: cg.totalMcapChg,
          totalMcapChgPct: cg.totalMcapChgPct,
          btcDom: cg.btcDom,
          ethDom: cg.ethDom,
          totalVolumeUsd: cg.totalVolumeUsd,
          activeCryptos: cg.activeCryptos,
          markets: cg.markets,
          top,
        }

        setState(prev => ({
          ...prev,
          loading: false,
          ...criticalData,
        }))

        // Cache the critical data immediately
        const partialState = { loading: true, ...criticalData }
        try {
          localStorage.setItem('gs:cache', JSON.stringify(partialState))
          localStorage.setItem('gs:cache_time', Date.now().toString())
        } catch {}

        // Load secondary data (traditional markets) with another delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const [spx, gold] = await Promise.all([
          getSP500().catch(e => ({ error: String(e), unavailable: true })),
          getGold().catch(e => ({ error: String(e), unavailable: true }))
        ])

        if (cancelled) return

        // Final update with all data
        const next = {
          loading: false,
          ...criticalData,
          spx,
          gold,
        }

        setState(next)
        try {
          localStorage.setItem('gs:cache', JSON.stringify(next))
          localStorage.setItem('gs:cache_time', Date.now().toString())
        } catch {}

      } catch (e) {
        console.error('Failed to load global summary:', e)
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: false, error: String(e) }))
        }
      }
    }

    load()

    // Increase refresh interval to 7 minutes to avoid rate limiting
    const id = setInterval(load, 7 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [enabled])

  return state
}
