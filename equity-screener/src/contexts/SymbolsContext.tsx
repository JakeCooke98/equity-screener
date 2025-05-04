'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
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

export function SymbolsProvider({ children }: { children: ReactNode }) {
  // Initialize state with empty array (will be populated from localStorage in useEffect)
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSearchMatch[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

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

  // Save to localStorage whenever selectedSymbols changes
  useEffect(() => {
    // Skip initial render to avoid clearing saved symbols
    if (!isInitialized) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSymbols))
    } catch (error) {
      console.error('Error saving symbols to localStorage:', error)
    }
  }, [selectedSymbols, isInitialized])

  const addSymbol = (symbol: SymbolSearchMatch) => {
    // Don't add if we already have 5 symbols (task requirement: 3-5 symbols)
    if (selectedSymbols.length >= 5) {
      return;
    }
    
    // Check if the symbol is already selected using a simplified check
    const isAlreadySelected = selectedSymbols.some(s => s.symbol === symbol.symbol)
    
    if (!isAlreadySelected) {
      // Create a new array reference to ensure state update is detected
      setSelectedSymbols(prev => [...prev, symbol]);
    }
  }

  const removeSymbol = (symbol: SymbolSearchMatch) => {
    // Create a new array reference
    setSelectedSymbols(prev => 
      prev.filter(s => s.symbol !== symbol.symbol)
    )
  }

  // Toggle function that adds or removes based on current state
  const toggleSymbol = (symbol: SymbolSearchMatch) => {
    const isAlreadySelected = isSymbolSelected(symbol);
    
    if (isAlreadySelected) {
      // If already selected, remove it
      removeSymbol(symbol);
    } else {
      // If not selected and we're below limit, add it
      if (selectedSymbols.length < 5) {
        addSymbol(symbol);
      }
    }
  }

  const clearSymbols = () => {
    setSelectedSymbols([])
  }

  const isSymbolSelected = (symbol: SymbolSearchMatch) => {
    // Basic validation
    if (!symbol || !symbol.symbol) {
      return false;
    }
    
    // Simplify the check to focus primarily on the ticker symbol
    return selectedSymbols.some(s => s.symbol === symbol.symbol);
  }

  return (
    <SymbolsContext.Provider 
      value={{ 
        selectedSymbols, 
        addSymbol, 
        removeSymbol, 
        clearSymbols,
        isSymbolSelected,
        toggleSymbol
      }}
    >
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