export function parseInstId(instId = '') {
  const parts = String(instId).split('-')
  const base = parts[0] || ''
  const quote = parts[1] || ''
  const contract = parts[2] || ''
  return { base, quote, contract }
}

export function friendlySymbol(instId, instType) {
  const { base, quote, contract } = parseInstId(instId)
  const core = base && quote ? `${base}/${quote}` : instId
  if (!instType && contract) instType = contract // fallback for e.g., SWAP suffix
  if (!instType) return core
  const t = instType.toUpperCase()
  if (t === 'SPOT') return core
  if (t === 'SWAP') return `${core} PERP`
  if (t === 'FUTURES') return `${core} FUT`
  return `${core} ${t}`
}

