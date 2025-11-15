// Curated list of AI-related crypto bases (tickers), uppercase
// This is a flexible, non-exhaustive set and can be extended.
const AI_BASES = [
  'RNDR', // Render
  'FET',  // Fetch.ai (now ASI alliance)
  'AGIX', // SingularityNET
  'GRT',  // The Graph
  'OCEAN',
  'TAO',  // Bittensor
  'AKT',  // Akash
  'ARKM', // Arkham
  'NMR',  // Numeraire
  'WLD',  // Worldcoin
  'PHB',
  'JASMY',
  'AIOZ',
  'PAAL',
  'NEAR', // Often included in AI narratives
]

export function isAICoinBase(base) {
  if (!base) return false
  return AI_BASES.includes(String(base).toUpperCase())
}

export function getAICoinSet() {
  return new Set(AI_BASES)
}

