import React, { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k })

const dict = {
  en: {
    menu: {
      globalOverview: 'Global Overview',
      spotMarket: 'Spot Market',
      aiSector: 'AI Sector',
      openInterest: 'Open Interest',
      futuresMarket: 'Futures Market',
      volumeSignals: 'Volume Signals',
      liquidationsFeed: 'Liquidations Feed',
    },
    summary: {
      pairsUsdt: 'Pairs (USDT)',
      volumeQuote24h: '24h Volume (quote)',
      advancers: 'Advancers',
      decliners: 'Decliners',
      avgChange: 'Avg Change',
      tracked: 'Tracked',
      sumUsdtPairs: 'Sum of USDT pairs',
      acrossPairs: 'Across tracked pairs',
    },
    movers: { topGainers: 'Top Gainers', topLosers: 'Top Losers' },
    table: {
      searchSpot: 'Search symbol (e.g. BTC)',
      columns: {
        symbol: 'Symbol', last: 'Last', pct24h: '24h %', high: 'High', low: 'Low', volQuote24h: '24h Vol (quote)', trend: 'Trend', type: 'Type', updated: 'Updated',
        oiContracts: 'OI (contracts)', oiCcy: 'OI (ccy)', side: 'Side', size: 'Size', price: 'Price', time: 'Time'
      },
      typeSpot: 'Spot', typeFutures: 'Futures', typePerp: 'Perp',
    },
    surprise: {
      title: 'Top Surprise Volume & Signals',
      search: 'Search symbol (e.g. BTC)',
      tracked: 'Tracked', ge2x: '>= 2x Vol', ge3x: '>= 3x Vol', bullish: 'Bullish signals', bearish: 'Bearish signals',
      avgVol7d: 'Avg Vol (7D, quote)', surpriseRatio: 'Surprise Ratio', signal: 'Signal',
      sBullish: 'Bullish', sBearish: 'Bearish', sHighVol: 'High Vol', sWatch: 'Watch'
    },
    total: {
      title: 'Global Market Summary',
      totalMcap: 'Total Market Cap', change24h: '24h change', btcDom: 'Bitcoin Dominance', altIndex: 'Altcoin Index', ethDom: 'ETH Dominance', vol24h: '24h Volume',
      activeCryptos: 'Active Cryptos', markets: (n) => `Markets: ${n}`,
      btc: 'Bitcoin (BTC)', eth: 'Ethereum (ETH)', fg: 'Fear & Greed', spx: 'S&P 500 (SPX)', gold: 'Gold (XAUUSD)', closeStooq: 'Close (Stooq)'
    },
    oi: { title: 'Open Interest (USDT-settled swaps)', totalOi: 'Total OI (ccy):', search: 'Search instrument (e.g. BTC-USDT-SWAP)' },
    liq: { title: 'Liquidations (recent)', window: 'Window', events: 'Events', long: 'Long', short: 'Short', search: 'Search instrument (e.g. BTC)' },
  },
  vi: {
    menu: {
      globalOverview: 'Tổng Quan',
      spotMarket: 'Thị Trường Spot',
      aiSector: 'Mảng AI',
      openInterest: 'Hợp Đồng Mở',
      futuresMarket: 'Hợp Đồng Kỳ Hạn',
      volumeSignals: 'Tín Hiệu Khối Lượng',
      liquidationsFeed: 'Thanh Lý',
    },
    summary: {
      pairsUsdt: 'Cặp (USDT)',
      volumeQuote24h: 'Khối lượng 24h (quote)',
      advancers: 'Tăng',
      decliners: 'Giảm',
      avgChange: 'TB thay đổi',
      tracked: 'Theo dõi',
      sumUsdtPairs: 'Tổng các cặp USDT',
      acrossPairs: 'Trên các cặp theo dõi',
    },
    movers: { topGainers: 'Tăng Mạnh', topLosers: 'Giảm Mạnh' },
    table: {
      searchSpot: 'Tìm ký hiệu (ví dụ BTC)',
      columns: {
        symbol: 'Ký hiệu', last: 'Giá', pct24h: '% 24h', high: 'Cao', low: 'Thấp', volQuote24h: 'KL 24h (quote)', trend: 'Xu hướng', type: 'Loại', updated: 'Cập nhật',
        oiContracts: 'OI (hợp đồng)', oiCcy: 'OI (đv tiền)', side: 'Phe', size: 'Khối lượng', price: 'Giá', time: 'Thời gian'
      },
      typeSpot: 'Spot', typeFutures: 'Futures', typePerp: 'Perp',
    },
    surprise: {
      title: 'Khối Lượng Bất Ngờ & Tín Hiệu',
      search: 'Tìm ký hiệu (ví dụ BTC)',
      tracked: 'Theo dõi', ge2x: '>= 2x KL', ge3x: '>= 3x KL', bullish: 'Tín hiệu Tăng', bearish: 'Tín hiệu Giảm',
      avgVol7d: 'KL TB 7N (quote)', surpriseRatio: 'Tỉ lệ Bất Ngờ', signal: 'Tín hiệu',
      sBullish: 'Tăng', sBearish: 'Giảm', sHighVol: 'KL Cao', sWatch: 'Theo dõi'
    },
    total: {
      title: 'Tổng Quan Thị Trường',
      totalMcap: 'Vốn Hóa Toàn Thị Trường', change24h: 'Thay đổi 24h', btcDom: 'Thống Trị Bitcoin', altIndex: 'Chỉ Số Altcoin', ethDom: 'Thống Trị ETH', vol24h: 'Khối Lượng 24h',
      activeCryptos: 'Số Crypto Hoạt Động', markets: (n) => `Sàn/Giao dịch: ${n}`,
      btc: 'Bitcoin (BTC)', eth: 'Ethereum (ETH)', fg: 'Fear & Greed', spx: 'S&P 500 (SPX)', gold: 'Vàng (XAUUSD)', closeStooq: 'Giá đóng cửa (Stooq)'
    },
    oi: { title: 'Hợp Đồng Mở (SWAP USDT)', totalOi: 'Tổng OI (đv tiền):', search: 'Tìm công cụ (vd. BTC-USDT-SWAP)' },
    liq: { title: 'Lệnh Thanh Lý (gần đây)', window: 'Khoảng', events: 'Sự kiện', long: 'Long', short: 'Short', search: 'Tìm công cụ (vd. BTC)' },
  },
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useLocalStorage('pref:lang', 'en')
  const t = (key, params) => {
    const parts = String(key).split('.')
    let node = dict[lang] || dict.en
    for (const p of parts) {
      if (node && typeof node === 'object' && p in node) node = node[p]
      else return key
    }
    if (typeof node === 'function') return node(params)
    return node || key
  }
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() { return useContext(I18nContext) }

