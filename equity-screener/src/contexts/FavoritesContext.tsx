'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react'
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

// Function to dispatch custom events
function dispatchFavoritesEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT))
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialize state with empty array (will be populated from localStorage in useEffect)
  const [favorites, setFavorites] = useState<SymbolSearchMatch[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use a ref to track pending updates
  const pendingUpdatesRef = useRef<Set<string>>(new Set())

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
          // Only update if there's a meaningful difference
          if (JSON.stringify(parsed) !== JSON.stringify(favorites)) {
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
  }, [favorites])

  // Save to localStorage whenever favorites changes
  useEffect(() => {
    // Skip initial render to avoid clearing saved favorites
    if (!isInitialized) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      // Dispatch custom event to notify other components
      dispatchFavoritesEvent()
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [favorites, isInitialized])

  // Helper function to check if a symbol is a favorite
  const isFavorite = useCallback((symbol: SymbolSearchMatch | string) => {
    // Basic validation
    if (!symbol) {
      return false
    }
    
    const symbolStr = typeof symbol === 'string' ? symbol : symbol.symbol
    if (!symbolStr) {
      return false
    }
    
    return favorites.some(s => s.symbol === symbolStr)
  }, [favorites])

  const addFavorite = useCallback((symbol: SymbolSearchMatch) => {
    const symbolId = symbol.symbol
    
    // Skip if already processing this symbol
    if (pendingUpdatesRef.current.has(symbolId)) {
      return
    }
    
    // Check if the symbol is already a favorite
    const isAlreadyFavorite = favorites.some(s => s.symbol === symbolId)
    
    if (!isAlreadyFavorite) {
      // Mark as being processed
      pendingUpdatesRef.current.add(symbolId)
      
      // Create a new array reference to ensure state update is detected
      setFavorites(prev => {
        const updated = [...prev, symbol]
        
        // Clear from pending after update
        setTimeout(() => {
          pendingUpdatesRef.current.delete(symbolId)
        }, 50)
        
        return updated
      })
    }
  }, [favorites])

  const removeFavorite = useCallback((symbol: SymbolSearchMatch | string) => {
    const symbolId = typeof symbol === 'string' ? symbol : symbol.symbol
    
    // Skip if already processing this symbol
    if (pendingUpdatesRef.current.has(symbolId)) {
      return
    }
    
    // Mark as being processed
    pendingUpdatesRef.current.add(symbolId)
    
    // Create a new array reference
    setFavorites(prev => {
      const updated = prev.filter(s => s.symbol !== symbolId)
      
      // Clear from pending after update
      setTimeout(() => {
        pendingUpdatesRef.current.delete(symbolId)
      }, 50)
      
      return updated
    })
  }, [])

  const toggleFavorite = useCallback((symbol: SymbolSearchMatch) => {
    const symbolId = symbol.symbol
    
    // Skip if already processing this symbol
    if (pendingUpdatesRef.current.has(symbolId)) {
      return
    }
    
    const isAlreadyFavorite = isFavorite(symbol)
    
    // Mark as being processed
    pendingUpdatesRef.current.add(symbolId)
    
    if (isAlreadyFavorite) {
      removeFavorite(symbol)
    } else {
      addFavorite(symbol)
    }
  }, [addFavorite, removeFavorite, isFavorite])

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