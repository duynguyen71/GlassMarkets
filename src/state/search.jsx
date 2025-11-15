import React, { createContext, useContext, useMemo, useState } from 'react'

const SearchContext = createContext({ counts: {}, recordSearch: () => {} })

export function SearchProvider({ children }) {
  const [counts, setCounts] = useState({})

  const recordSearch = (query) => {
    const q = String(query || '').trim().toUpperCase()
    if (!q || q.length < 2) return
    // Track by base symbol (letters only) e.g., BTC, ETH
    const base = q.replace(/[^A-Z]/g, '')
    if (!base) return
    setCounts((prev) => ({ ...prev, [base]: (prev[base] || 0) + 1 }))
  }

  const value = useMemo(() => ({ counts, recordSearch }), [counts])
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  return useContext(SearchContext)
}

