export const formatNumber = (n, options = {}) => {
  if (n == null || Number.isNaN(n)) return '-'
  return new Intl.NumberFormat(undefined, options).format(n)
}

export const formatUSD = (n) => {
  if (n == null || Number.isNaN(n)) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)
}

export const formatPct = (n) => {
  if (n == null || Number.isNaN(n)) return '-'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

// Format crypto prices with adaptive precision so very small values are visible
export const formatPrice = (n) => {
  if (n == null || Number.isNaN(n)) return '-'
  const abs = Math.abs(n)
  if (abs >= 100000) return formatNumber(n, { notation: 'compact', maximumFractionDigits: 2 })
  if (abs >= 1) return formatNumber(n, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  if (abs >= 0.01) return formatNumber(n, { minimumFractionDigits: 4, maximumFractionDigits: 8 })
  if (abs >= 0.000001) return formatNumber(n, { minimumFractionDigits: 6, maximumFractionDigits: 10 })
  // Extremely small: fall back to scientific with 2-3 significant digits
  try {
    return Number(n).toExponential(2)
  } catch {
    return String(n)
  }
}
