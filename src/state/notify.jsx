import React, { createContext, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const NotifyContext = createContext({ enabled: false, setEnabled: () => {}, canNotify: false, notify: () => {} })

export function NotifyProvider({ children }) {
  const [enabled, setEnabled] = useLocalStorage('pref:notifEnabled', false)

  const canNotify = typeof window !== 'undefined' && 'Notification' in window

  const notify = async (title, options = {}) => {
    try {
      if (!canNotify) return
      let perm = Notification.permission
      if (perm === 'default') {
        perm = await Notification.requestPermission()
      }
      if (perm === 'granted') {
        new Notification(title, options)
      }
    } catch {}
  }

  const value = useMemo(() => ({ enabled, setEnabled, canNotify, notify }), [enabled, canNotify])
  return <NotifyContext.Provider value={value}>{children}</NotifyContext.Provider>
}

export function useNotify() {
  return useContext(NotifyContext)
}
