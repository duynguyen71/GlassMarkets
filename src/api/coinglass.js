import axios from 'axios'

// Coinglass provides aggregated liquidation data from multiple exchanges
const COINGLASS_API = 'https://open-api.coinglass.com/public/v2'

/**
 * Fetch recent liquidation data from Coinglass
 * @param {Object} options
 * @param {string} options.symbol - Trading pair symbol (e.g., 'BTC', 'ETH')
 * @param {number} options.limit - Number of records to fetch
 * @returns {Promise<Array>} Array of liquidation events
 */
export async function fetchCoingLassLiquidations({ symbol = 'BTC', limit = 100 } = {}) {
  try {
    const url = `${COINGLASS_API}/liquidation_history?symbol=${symbol}&time_type=h1`
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'accept': 'application/json'
      }
    })

    const data = res?.data?.data || []
    return normalizeCoingLassData(data, symbol).slice(0, limit)
  } catch (error) {
    console.error('Coinglass liquidation fetch error:', error)
    return []
  }
}

/**
 * Fetch liquidation data for multiple symbols
 */
export async function fetchMultipleSymbolLiquidations({ symbols = ['BTC', 'ETH', 'SOL', 'BNB'], limit = 100 } = {}) {
  try {
    const results = await Promise.allSettled(
      symbols.map(symbol => fetchCoingLassLiquidations({ symbol, limit: Math.ceil(limit / symbols.length) }))
    )

    const allEvents = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allEvents.push(...result.value)
      }
    }

    // Sort by timestamp descending and limit
    return allEvents
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit)
  } catch (error) {
    console.error('Multiple symbol liquidation fetch error:', error)
    return []
  }
}

function normalizeCoingLassData(data, symbol) {
  if (!Array.isArray(data)) return []

  const events = []
  for (const item of data) {
    // Coinglass returns aggregated data, we'll create events for both longs and shorts if present
    const timestamp = Number(item.createTime) || Date.now()
    const longLiq = Number(item.longLiquidation) || 0
    const shortLiq = Number(item.shortLiquidation) || 0
    const price = Number(item.price) || 0

    if (longLiq > 0) {
      events.push({
        instId: `${symbol}USDT`,
        base: symbol,
        side: 'long',
        sz: longLiq,
        px: price,
        ts: timestamp
      })
    }

    if (shortLiq > 0) {
      events.push({
        instId: `${symbol}USDT`,
        base: symbol,
        side: 'short',
        sz: shortLiq,
        px: price,
        ts: timestamp
      })
    }
  }

  return events
}

/**
 * Alternative: Use aggregated liquidation heatmap data
 */
export async function fetchLiquidationHeatmap({ symbol = 'BTC' } = {}) {
  try {
    const url = `${COINGLASS_API}/liquidation_chart?symbol=${symbol}&time_type=all`
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'accept': 'application/json'
      }
    })

    return res?.data?.data || []
  } catch (error) {
    console.error('Liquidation heatmap fetch error:', error)
    return []
  }
}
