import axios from 'axios'

const BINANCE_REST = (import.meta?.env?.DEV ? '/_bn' : 'https://api.binance.com')
const BINANCE_WS = 'wss://stream.binance.com:9443/stream'

function toInstId(sym) {
  // e.g. BTCUSDT -> BTC-USDT, ETHUSDC -> ETH-USDC
  const quoteCandidates = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD']
  for (const q of quoteCandidates) {
    if (sym.endsWith(q)) return sym.slice(0, sym.length - q.length) + '-' + q
  }
  return sym
}

function toBinanceSymbol(instId) {
  return String(instId).replace(/-/g, '').toUpperCase()
}

export function normalizeTicker(d) {
  const symbol = toInstId(d.symbol)
  const last = parseFloat(d.lastPrice)
  const open24h = parseFloat(d.openPrice)
  const high24h = parseFloat(d.highPrice)
  const low24h = parseFloat(d.lowPrice)
  const volCcy = parseFloat(d.quoteVolume) // 24h quote volume
  const changePct = open24h ? ((last - open24h) / open24h) * 100 : 0
  const [base, quote] = symbol.split('-')
  return {
    exchange: 'Binance',
    symbol,
    base,
    quote,
    last,
    open24h,
    high24h,
    low24h,
    vol24h: parseFloat(d.volume),
    volCcy24h: volCcy,
    change24hPct: changePct,
    ts: Date.now(),
  }
}

export async function fetchSpotTickersBinance() {
  const url = `${BINANCE_REST}/api/v3/ticker/24hr`
  const res = await axios.get(url, { timeout: 15000 })
  const list = res?.data || []
  // Keep major quote assets only for consistency
  const norm = list.map(normalizeTicker).filter((t) => ['USDT', 'USDC'].includes(t.quote))
  return norm
}

export function openBinanceTickerStream(instIds, onUpdate) {
  if (!instIds?.length) return () => {}
  // Convert to binance lowercase symbols without dash: BTC-USDT -> btcusdt
  const streams = instIds.map((id) => id.replace('-', '').toLowerCase() + '@ticker').join('/')
  const url = `${BINANCE_WS}?streams=${streams}`
  const ws = new WebSocket(url)
  let alive = true

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      const d = msg?.data
      if (!d) return
      const norm = normalizeTicker({
        symbol: d.s,
        lastPrice: d.c,
        openPrice: d.o,
        highPrice: d.h,
        lowPrice: d.l,
        volume: d.v,
        quoteVolume: d.q,
      })
      onUpdate(norm)
    } catch {}
  }
  ws.onclose = () => { alive = false }
  ws.onerror = () => {}
  return () => { try { alive = false; ws.close() } catch {} }
}

export async function fetchKlinesBinance(instId, { interval = '5m', limit = 60 } = {}) {
  const symbol = toBinanceSymbol(instId)
  const url = `${BINANCE_REST}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await axios.get(url, { timeout: 15000 })
  return res?.data || []
}

// Fetch Binance Alpha coins from announcements or API
export async function fetchBinanceAlphaCoins() {
  try {
    // Fetch from Binance's public API for announcements
    // catalogId=48 is for "New Cryptocurrency Listing" which includes Alpha announcements
    const url = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=50'
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    })

    const articles = res?.data?.data?.articles || []
    const alphaCoins = new Set()

    // Parse Binance Alpha announcements
    articles.forEach(article => {
      const title = article?.title || ''
      const lowerTitle = title.toLowerCase()

      // Look specifically for "binance alpha" announcements
      if (lowerTitle.includes('binance alpha')) {
        // Extract patterns like "Binance Alpha Lists COOKIE, AIXBT, TOKEN"
        // or "Binance Alpha Project: TOKEN"

        // Pattern 1: "Lists TOKEN1, TOKEN2, TOKEN3"
        const listsMatch = title.match(/Lists?\s+([A-Z,\s&]+?)(?:\s+\(|\s*$)/i)
        if (listsMatch) {
          const tokens = listsMatch[1].split(/[,&\s]+/).filter(t => t.length >= 2 && t.length <= 10)
          tokens.forEach(token => {
            const upper = token.toUpperCase().trim()
            if (upper && !['BINANCE', 'ALPHA', 'LISTS', 'AND', 'THE', 'PROJECT'].includes(upper)) {
              alphaCoins.add(upper)
            }
          })
        }

        // Pattern 2: Extract all uppercase words (2-10 chars) that could be tokens
        const words = title.match(/\b[A-Z]{2,10}\b/g) || []
        words.forEach(word => {
          if (!['BINANCE', 'ALPHA', 'LISTS', 'LIST', 'PROJECT', 'USDT', 'USDC', 'AND', 'THE', 'FOR', 'TO'].includes(word)) {
            alphaCoins.add(word)
          }
        })
      }
    })

    const result = Array.from(alphaCoins)

    // If we got results, use them; otherwise use fallback
    return result.length > 0 ? result : getFallbackAlphaCoins()
  } catch (error) {
    console.error('Failed to fetch Binance Alpha coins:', error)
    return getFallbackAlphaCoins()
  }
}

// Fallback list - Update this manually with actual Binance Alpha coins
function getFallbackAlphaCoins() {
  return [
    // Batch 1-5 (Dec 2024 - Jan 2025)
    'COOKIE', 'CERES', 'GRIFFAIN', 'KMNO', 'AIXBT',
    'FROG', 'MONKY', 'TERMINUS', 'CGPT', 'UFD',
    'LAYER', 'AVAAI', 'ZEREBRO', 'PIPPIN', 'AI16Z',

    // Additional known Alpha listings
    'PNUT', 'ACT', 'GOAT', 'VIRTUAL', 'SWARMS',
    'SNAI', 'FARTCOIN', 'MILK',
  ]
}
