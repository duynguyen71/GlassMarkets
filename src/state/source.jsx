import React, { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const SourceContext = createContext({ source: 'OKX', setSource: () => {} })

export function SourceProvider({ children }) {
  const [source, setSource] = useLocalStorage('pref:source', 'Binance')
  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  )
}

export function useSource() {
  return useContext(SourceContext)
}
