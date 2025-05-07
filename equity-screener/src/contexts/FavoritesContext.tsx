'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'
import { SymbolSearchMatch } from '@/services/alphaVantage'

interface FavoritesContextType {
  favorites: SymbolSearchMatch[]
  favoritesCount: number
  addFavorite: (symbol: SymbolSearchMatch) => void
  removeFavorite: (symbol: SymbolSearchMatch | string) => void
  clearFavorites: () => void
  isFavorite: (symbol: SymbolSearchMatch | string) => boolean
  toggleFavorite: (symbol: SymbolSearchMatch) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Key for localStorage
const STORAGE_KEY = 'equity-screener-favorites'

// Custom event for favorites changes
const FAVORITES_UPDATED_EVENT = 'favoritesUpdated'

// Simple function to dispatch events when favorites change
function notifyFavoritesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT))
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialize state with empty array (will be populated from localStorage in useEffect)
  const [favorites, setFavorites] = useState<SymbolSearchMatch[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use a ref to track the latest favorites to avoid dependency cycles
  const favoritesRef = useRef<SymbolSearchMatch[]>([])
  
  // Keep the ref updated with latest favorites
  useEffect(() => {
    favoritesRef.current = favorites
  }, [favorites])

  // Calculate favorites count from array length
  const favoritesCount = favorites.length

  // Load saved favorites from localStorage on initial render
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(STORAGE_KEY)
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites) as SymbolSearchMatch[]
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])
  
  // Listen for custom events for favorites changes
  useEffect(() => {
    const handleFavoritesUpdated = () => {
      try {
        const savedFavorites = localStorage.getItem(STORAGE_KEY)
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites) as SymbolSearchMatch[]
          // Compare with current state using the ref instead of the state itself
          // to avoid dependency cycles
          const currentFavorites = favoritesRef.current
          if (JSON.stringify(parsed) !== JSON.stringify(currentFavorites)) {
            setFavorites(parsed)
          }
        }
      } catch (error) {
        console.error('Error handling favorites updated event:', error)
      }
    }
    
    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    }
  }, []) // <- removed favorites dependency

  // Save to localStorage whenever favorites changes
  useEffect(() => {
    if (!isInitialized) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      notifyFavoritesChanged()
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [favorites, isInitialized])

  // Helper function to check if a symbol is a favorite
  const isFavorite = useCallback((symbol: SymbolSearchMatch | string): boolean => {
    if (!symbol) return false
    
    const symbolId = typeof symbol === 'string' ? symbol : symbol.symbol
    if (!symbolId) return false
    
    return favorites.some(s => s.symbol === symbolId)
  }, [favorites])

  const addFavorite = useCallback((symbol: SymbolSearchMatch) => {
    if (!symbol?.symbol) return
    
    setFavorites(prev => {
      // Don't add if it already exists
      if (prev.some(s => s.symbol === symbol.symbol)) {
        return prev
      }
      return [...prev, symbol]
    })
  }, [])

  const removeFavorite = useCallback((symbol: SymbolSearchMatch | string) => {
    const symbolId = typeof symbol === 'string' ? symbol : symbol.symbol
    if (!symbolId) return
    
    setFavorites(prev => prev.filter(s => s.symbol !== symbolId))
  }, [])

  const toggleFavorite = useCallback((symbol: SymbolSearchMatch) => {
    if (isFavorite(symbol)) {
      removeFavorite(symbol)
    } else {
      addFavorite(symbol)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = React.useMemo(() => ({
    favorites, 
    favoritesCount,
    addFavorite, 
    removeFavorite, 
    clearFavorites,
    isFavorite,
    toggleFavorite
  }), [
    favorites, 
    favoritesCount,
    addFavorite, 
    removeFavorite, 
    clearFavorites,
    isFavorite,
    toggleFavorite
  ])

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  
  return context
} 