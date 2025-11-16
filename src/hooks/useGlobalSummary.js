import { useEffect, useState } from 'react'

async function fetchJSON(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() }
async function fetchText(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() }

const PROXY_BASE = import.meta?.env?.VITE_PROXY_BASE || ''
const isDev = !!import.meta?.env?.DEV

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
  } catch (e) { return { error: String(e) } }
}

async function getCoingeckoGlobal() {
  try {
    const j = await fetchJSON(cgUrl('/api/v3/global'))
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
  } catch (e) { return { error: String(e) } }
}

async function getTopPrices() {
  try {
    const j = await fetchJSON(cgUrl('/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'))
    const btc = j?.bitcoin || {}
    const eth = j?.ethereum || {}
    return {
      btc: { price: Number(btc.usd || 0), chgPct: Number(btc.usd_24h_change || 0) },
      eth: { price: Number(eth.usd || 0), chgPct: Number(eth.usd_24h_change || 0) },
    }
  } catch (e) { return { error: String(e) } }
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
    const t = await fetchText(stooqUrl('/q/d/l/?s=%5Espx&i=d'))
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
    const t = await fetchText(stooqUrl('/q/d/l/?s=xauusd&i=d'))
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
  try { cached = JSON.parse(localStorage.getItem('gs:cache') || 'null') } catch {}
  const [state, setState] = useState(() => cached ? { ...cached, loading: true } : { loading: true })

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true }))
      const [fng, cg, spx, gold, top] = await Promise.all([getFearGreed(), getCoingeckoGlobal(), getSP500(), getGold(), getTopPrices()])
      if (cancelled) return
      const next = {
        loading: false,
        fng,
        totalMcap: cg.totalMcap,
        totalMcapChg: cg.totalMcapChg,
        totalMcapChgPct: cg.totalMcapChgPct,
        btcDom: cg.btcDom,
        ethDom: cg.ethDom,
        totalVolumeUsd: cg.totalVolumeUsd,
        activeCryptos: cg.activeCryptos,
        markets: cg.markets,
        spx,
        gold,
        top,
      }
      setState(next)
      try { localStorage.setItem('gs:cache', JSON.stringify(next)) } catch {}
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [enabled])

  return state
}
