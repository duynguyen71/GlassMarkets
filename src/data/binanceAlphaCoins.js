// Curated list of Binance Alpha listings
// This tracks tokens that have been announced/listed on Binance Alpha
// Can be updated as new tokens are announced
const BINANCE_ALPHA_BASES = [
  'AIXBT',
  'COOKIE',
  'CERES',
  'FROG',
  'MONKY',
  'TERMINUS',
  'CGPT',
  'PIPPIN',
  'UFD',
  'MILK',
  'LAYER',
  'GRIFFAIN',
  'AVAAI',
  'KMNO',
  'FARTCOIN',
  'PNUT',
  'ACT',
  'ZEREBRO',
  'GOAT',
  'VIRTUAL',
  'AI16Z',
  'SWARMS',
  'SNAI',
]

export function isBinanceAlphaCoinBase(base) {
  if (!base) return false
  return BINANCE_ALPHA_BASES.includes(String(base).toUpperCase())
}

export function getBinanceAlphaCoinSet() {
  return new Set(BINANCE_ALPHA_BASES)
}
