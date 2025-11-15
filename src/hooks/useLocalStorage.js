import { useEffect, useRef, useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const keyRef = useRef(key)
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(keyRef.current)
      return raw != null ? JSON.parse(raw) : (typeof initialValue === 'function' ? initialValue() : initialValue)
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  useEffect(() => {
    keyRef.current = key
  }, [key])

  useEffect(() => {
    try { localStorage.setItem(keyRef.current, JSON.stringify(state)) } catch {}
  }, [state])

  return [state, setState]
}

