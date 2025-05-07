'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'
import { SymbolSearchMatch } from '@/services/alphaVantage'

interface SymbolsContextType {
  selectedSymbols: SymbolSearchMatch[]
  addSymbol: (symbol: SymbolSearchMatch) => void
  removeSymbol: (symbol: SymbolSearchMatch) => void
  clearSymbols: () => void
  isSymbolSelected: (symbol: SymbolSearchMatch) => boolean
  toggleSymbol: (symbol: SymbolSearchMatch) => void
}

const SymbolsContext = createContext<SymbolsContextType | undefined>(undefined)

// Key for localStorage
const STORAGE_KEY = 'equity-screener-selected-symbols'

// Custom event for symbols changes
const SYMBOLS_UPDATED_EVENT = 'symbolsUpdated'

// Simple function to dispatch events when symbols change
function notifySymbolsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYMBOLS_UPDATED_EVENT))
  }
}

export function SymbolsProvider({ children }: { children: ReactNode }) {
  // Initialize state with empty array (will be populated from localStorage in useEffect)
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSearchMatch[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use a ref to track the latest symbols to avoid dependency cycles
  const symbolsRef = useRef<SymbolSearchMatch[]>([])
  
  // Keep the ref updated with latest symbols
  useEffect(() => {
    symbolsRef.current = selectedSymbols
  }, [selectedSymbols])

  // Load saved symbols from localStorage on initial render
  useEffect(() => {
    try {
      const savedSymbols = localStorage.getItem(STORAGE_KEY)
      if (savedSymbols) {
        const parsed = JSON.parse(savedSymbols) as SymbolSearchMatch[]
        setSelectedSymbols(parsed)
      }
    } catch (error) {
      console.error('Error loading symbols from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])
  
  // Listen for custom events for symbols changes
  useEffect(() => {
    const handleSymbolsUpdated = () => {
      try {
        const savedSymbols = localStorage.getItem(STORAGE_KEY)
        if (savedSymbols) {
          const parsed = JSON.parse(savedSymbols) as SymbolSearchMatch[]
          // Compare with current state using the ref to avoid dependency cycles
          const currentSymbols = symbolsRef.current
          if (JSON.stringify(parsed) !== JSON.stringify(currentSymbols)) {
            setSelectedSymbols(parsed)
          }
        }
      } catch (error) {
        console.error('Error handling symbols updated event:', error)
      }
    }
    
    window.addEventListener(SYMBOLS_UPDATED_EVENT, handleSymbolsUpdated)
    
    return () => {
      window.removeEventListener(SYMBOLS_UPDATED_EVENT, handleSymbolsUpdated)
    }
  }, []) // No dependencies to avoid cycles

  // Save to localStorage whenever selectedSymbols changes
  useEffect(() => {
    if (!isInitialized) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSymbols))
      notifySymbolsChanged()
    } catch (error) {
      console.error('Error saving symbols to localStorage:', error)
    }
  }, [selectedSymbols, isInitialized])

  const addSymbol = useCallback((symbol: SymbolSearchMatch) => {
    if (!symbol?.symbol) return
    
    setSelectedSymbols(prev => {
      // Don't add if we already have 5 symbols (task requirement: 3-5 symbols)
      if (prev.length >= 5) {
        return prev
      }
      
      // Don't add if it already exists
      if (prev.some(s => s.symbol === symbol.symbol)) {
        return prev
      }
      
      return [...prev, symbol]
    })
  }, [])

  const removeSymbol = useCallback((symbol: SymbolSearchMatch) => {
    if (!symbol?.symbol) return
    
    setSelectedSymbols(prev => 
      prev.filter(s => s.symbol !== symbol.symbol)
    )
  }, [])

  const isSymbolSelected = useCallback((symbol: SymbolSearchMatch): boolean => {
    // Basic validation
    if (!symbol || !symbol.symbol) {
      return false
    }
    
    // Simplify the check to focus primarily on the ticker symbol
    return selectedSymbols.some(s => s.symbol === symbol.symbol)
  }, [selectedSymbols])

  // Toggle function that adds or removes based on current state
  const toggleSymbol = useCallback((symbol: SymbolSearchMatch) => {
    if (!symbol?.symbol) return
    
    if (isSymbolSelected(symbol)) {
      removeSymbol(symbol)
    } else {
      addSymbol(symbol)
    }
  }, [isSymbolSelected, removeSymbol, addSymbol])

  const clearSymbols = useCallback(() => {
    setSelectedSymbols([])
  }, [])

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = React.useMemo(() => ({
    selectedSymbols,
    addSymbol,
    removeSymbol,
    clearSymbols,
    isSymbolSelected,
    toggleSymbol
  }), [
    selectedSymbols,
    addSymbol,
    removeSymbol,
    clearSymbols,
    isSymbolSelected,
    toggleSymbol
  ])

  return (
    <SymbolsContext.Provider value={contextValue}>
      {children}
    </SymbolsContext.Provider>
  )
}

export function useSymbols() {
  const context = useContext(SymbolsContext)
  
  if (context === undefined) {
    throw new Error('useSymbols must be used within a SymbolsProvider')
  }
  
  return context
} 