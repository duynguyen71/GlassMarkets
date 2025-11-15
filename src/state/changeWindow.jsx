import React, { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const Ctx = createContext({ window: '24h', setWindow: () => {} })

export function ChangeWindowProvider({ children }) {
  const [win, setWin] = useLocalStorage('pref:changeWindow', '24h')
  return <Ctx.Provider value={{ window: win, setWindow: setWin }}>{children}</Ctx.Provider>
}

export function useChangeWindow() { return useContext(Ctx) }

