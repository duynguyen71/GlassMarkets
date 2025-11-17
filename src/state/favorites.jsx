import React, { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
})

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage('pref:favorites', [])

  const toggleFavorite = useCallback((symbol) => {
    if (!symbol) return
    setFavorites((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((item) => item !== symbol)
      }
      return [...prev, symbol]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((symbol) => {
    if (!symbol) return
    setFavorites((prev) => prev.filter((item) => item !== symbol))
  }, [setFavorites])

  const isFavorite = useCallback((symbol) => {
    if (!symbol) return false
    return favorites.includes(symbol)
  }, [favorites])

  const value = useMemo(() => ({ favorites, toggleFavorite, removeFavorite, isFavorite }), [favorites, toggleFavorite, removeFavorite, isFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
