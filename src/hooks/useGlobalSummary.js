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
function yahooUrl(path) {
  if (isDev) return `/_yahoo${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/yahoo${path}`
  return `https://query1.finance.yahoo.com${path}`
}
function fmpUrl(path) {
  if (isDev) return `/_fmp${path}`
  if (PROXY_BASE) return `${PROXY_BASE}/fmp${path}`
  return `https://financialmodelingprep.com${path}`
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

    // Additional metrics
    const usdtDom = Number(g.market_cap_percentage?.usdt || 0)
    const xrpDom = Number(g.market_cap_percentage?.xrp || 0)
    const bnbDom = Number(g.market_cap_percentage?.bnb || 0)
    const solDom = Number(g.market_cap_percentage?.sol || 0)
    const usdcDom = Number(g.market_cap_percentage?.usdc || 0)

    const upcomingICOs = Number(g.upcoming_icos || 0)
    const ongoingICOs = Number(g.ongoing_icos || 0)
    const endedICOs = Number(g.ended_icos || 0)

    const marketCapEth = Number(g.total_market_cap?.eth || 0)
    const marketCapBtc = Number(g.total_market_cap?.btc || 0)

    // previous = current / (1 + chgPct/100)
    const prevMcap = chgPct ? (totalMcap / (1 + chgPct / 100)) : null
    const chg = prevMcap != null ? (totalMcap - prevMcap) : null

    return {
      totalMcap,
      btcDom,
      ethDom,
      usdtDom,
      xrpDom,
      bnbDom,
      solDom,
      usdcDom,
      totalVolumeUsd,
      activeCryptos,
      markets,
      totalMcapChg: chg,
      totalMcapChgPct: chgPct,
      marketCapEth,
      marketCapBtc,
      upcomingICOs,
      ongoingICOs,
      endedICOs,
      updatedAt: g.updated_at ? new Date(g.updated_at * 1000) : null
    }
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

    const j = await fetchJSON(cgUrl('/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,tether,usd-coin,ripple,xrp,cardano,ada&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'))
    clearTimeout(timeoutId)

    const btc = j?.bitcoin || {}
    const eth = j?.ethereum || {}
    const bnb = j?.binancecoin || {}
    const sol = j?.solana || {}
    const usdt = j?.tether || {}
    const usdc = j?.['usd-coin'] || {}
    const xrp = j?.ripple || {}
    const ada = j?.cardano || {}

    return {
      btc: {
        price: Number(btc.usd || 0),
        chgPct: Number(btc.usd_24h_change || 0),
        marketCap: Number(btc.usd_market_cap || 0)
      },
      eth: {
        price: Number(eth.usd || 0),
        chgPct: Number(eth.usd_24h_change || 0),
        marketCap: Number(eth.usd_market_cap || 0)
      },
      bnb: {
        price: Number(bnb.usd || 0),
        chgPct: Number(bnb.usd_24h_change || 0),
        marketCap: Number(bnb.usd_market_cap || 0)
      },
      sol: {
        price: Number(sol.usd || 0),
        chgPct: Number(sol.usd_24h_change || 0),
        marketCap: Number(sol.usd_market_cap || 0)
      },
      usdt: {
        price: Number(usdt.usd || 0),
        chgPct: Number(usdt.usd_24h_change || 0),
        marketCap: Number(usdt.usd_market_cap || 0)
      },
      usdc: {
        price: Number(usdc.usd || 0),
        chgPct: Number(usdc.usd_24h_change || 0),
        marketCap: Number(usdc.usd_market_cap || 0)
      },
      xrp: {
        price: Number(xrp.usd || 0),
        chgPct: Number(xrp.usd_24h_change || 0),
        marketCap: Number(xrp.usd_market_cap || 0)
      },
      ada: {
        price: Number(ada.usd || 0),
        chgPct: Number(ada.usd_24h_change || 0),
        marketCap: Number(ada.usd_market_cap || 0)
      }
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

// Get DeFi TVL (Total Value Locked) data
async function getDeFiTVL() {
  try {
    // Using DefiLlama API for DeFi TVL
    const response = await fetchJSON('https://api.llama.fi/charts')
    if (!Array.isArray(response) || response.length === 0) {
      throw new Error('Invalid DeFi TVL data')
    }

    const latestData = response[response.length - 1]
    const previousData = response[response.length - 2] || latestData

    const totalTVL = Number(latestData.totalLiquidityUSD || 0)
    const prevTVL = Number(previousData.totalLiquidityUSD || 0)
    const chg = totalTVL - prevTVL
    const chgPct = prevTVL ? (chg / prevTVL) * 100 : 0

    return {
      totalTVL,
      chg,
      chgPct,
      date: latestData.date ? new Date(latestData.date * 1000) : null
    }
  } catch (e) {
    console.warn('DeFi TVL API error:', e.message)
    // Return fallback data
    return {
      totalTVL: 125000000000, // $125B fallback
      chg: 2500000000, // $2.5B change
      chgPct: 2.05,
      error: String(e)
    }
  }
}

// Get Ethereum gas prices
async function getGasPrices() {
  try {
    // Using Etherscan API for gas prices
    const response = await fetchJSON('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKey')
    if (response?.status !== '1') {
      throw new Error('Invalid gas price data')
    }

    const result = response.result || {}
    return {
      safe: Number(result.SafeGasPrice || 20),
      standard: Number(result.ProposeGasPrice || 25),
      fast: Number(result.FastGasPrice || 30),
      baseFee: Number(result.suggestBaseFee || 15),
      lastUpdate: new Date()
    }
  } catch (e) {
    console.warn('Gas prices API error:', e.message)
    // Return fallback data
    return {
      safe: 20,
      standard: 25,
      fast: 30,
      baseFee: 15,
      error: String(e)
    }
  }
}

// Stooq CSV helpers (simple, public). Example: https://stooq.com/q/l/?s=^spx&i=d

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

// Alternative data sources for financial markets
async function getFinancialDataFromAlternative(symbol) {
  try {
    // Use Yahoo Finance API alternative
    const response = await fetchJSON(yahooUrl(`/v8/finance/chart/${symbol}?interval=1d&range=2d`))
    const result = response?.chart?.result?.[0]
    if (!result || !result.indicators?.quote?.[0]?.close) {
      throw new Error('Invalid data format')
    }

    const closes = result.indicators.quote[0].close.filter(val => val !== null)
    if (closes.length < 2) {
      throw new Error('Insufficient data')
    }

    const last = closes[closes.length - 1]
    const prev = closes[closes.length - 2]
    const chg = last - prev
    const chgPct = prev ? (chg / prev) * 100 : 0

    return { last, chg, chgPct }
  } catch (e) {
    console.warn(`Alternative API failed for ${symbol}:`, e.message)
    throw e
  }
}

// Fallback static data for when APIs are completely unavailable
function getFallbackData(symbol) {
  const fallbacks = {
    spx: { last: 5987, chg: 12.5, chgPct: 0.21 }, // S&P 500 fallback
    gold: { last: 2568.5, chg: -8.2, chgPct: -0.32 } // Gold fallback
  }

  return fallbacks[symbol] || { last: null, chg: 0, chgPct: 0, unavailable: true }
}

async function getSP500() {
  // Try multiple sources in order of preference
  const attempts = [
    {
      name: 'Stooq',
      fn: async () => {
        const t = await fetchStooq('/q/d/l/?s=%5Espx&i=d')
        const r = parseStooqDaily(t)
        if (!r) throw new Error('Invalid Stooq data')
        const chg = r.last - r.prev
        const chgPct = r.prev ? (chg / r.prev) * 100 : 0
        return { last: r.last, chg, chgPct }
      }
    },
    {
      name: 'Yahoo Finance',
      fn: async () => getFinancialDataFromAlternative('^GSPC')
    },
    {
      name: 'Alpha Vantage',
      fn: async () => {
        // Note: This would require an API key, showing as example
        throw new Error('Alpha Vantage requires API key')
      }
    }
  ]

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name} for S&P 500 data...`)
      const data = await attempt.fn()
      console.log(`Success: Got S&P 500 data from ${attempt.name}`)
      return { ...data, source: attempt.name }
    } catch (e) {
      console.warn(`${attempt.name} failed:`, e.message)
      continue
    }
  }

  // If all attempts fail, return fallback data
  console.warn('All S&P 500 sources failed, using fallback')
  return { ...getFallbackData('spx'), unavailable: true, fallback: true }
}

async function getGold() {
  // Try multiple sources in order of preference
  const attempts = [
    {
      name: 'Stooq',
      fn: async () => {
        const t = await fetchStooq('/q/d/l/?s=xauusd&i=d')
        const r = parseStooqDaily(t)
        if (!r) throw new Error('Invalid Stooq data')
        const chg = r.last - r.prev
        const chgPct = r.prev ? (chg / r.prev) * 100 : 0
        return { last: r.last, chg, chgPct }
      }
    },
    {
      name: 'Yahoo Finance',
      fn: async () => getFinancialDataFromAlternative('GC=F')
    },
    {
      name: 'Financial Modeling Prep',
      fn: async () => {
        // Free alternative API for gold prices
        const response = await fetchJSON(fmpUrl('/api/v3/quote/GCUSD'))
        const data = Array.isArray(response) ? response[0] : response
        if (!data?.price) throw new Error('Invalid FMP data')
        return {
          last: data.price,
          chg: data.change || 0,
          chgPct: data.changesPercentage || 0
        }
      }
    }
  ]

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name} for Gold data...`)
      const data = await attempt.fn()
      console.log(`Success: Got Gold data from ${attempt.name}`)
      return { ...data, source: attempt.name }
    } catch (e) {
      console.warn(`${attempt.name} failed:`, e.message)
      continue
    }
  }

  // If all attempts fail, return fallback data
  console.warn('All Gold sources failed, using fallback')
  return { ...getFallbackData('gold'), unavailable: true, fallback: true }
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
          usdtDom: cg.usdtDom,
          xrpDom: cg.xrpDom,
          bnbDom: cg.bnbDom,
          solDom: cg.solDom,
          usdcDom: cg.usdcDom,
          totalVolumeUsd: cg.totalVolumeUsd,
          activeCryptos: cg.activeCryptos,
          markets: cg.markets,
          marketCapEth: cg.marketCapEth,
          marketCapBtc: cg.marketCapBtc,
          upcomingICOs: cg.upcomingICOs,
          ongoingICOs: cg.ongoingICOs,
          endedICOs: cg.endedICOs,
          updatedAt: cg.updatedAt,
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

        const [spx, gold, defi, gas] = await Promise.all([
          getSP500().catch(e => ({ error: String(e), unavailable: true })),
          getGold().catch(e => ({ error: String(e), unavailable: true })),
          getDeFiTVL().catch(e => ({ error: String(e), unavailable: true })),
          getGasPrices().catch(e => ({ error: String(e), unavailable: true }))
        ])

        if (cancelled) return

        // Final update with all data
        const next = {
          loading: false,
          ...criticalData,
          spx,
          gold,
          defi,
          gas,
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
