'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
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

export function SymbolsProvider({ children }: { children: ReactNode }) {
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSearchMatch[]>([])

  const addSymbol = (symbol: SymbolSearchMatch) => {
    // Don't add if we already have 5 symbols (task requirement: 3-5 symbols)
    if (selectedSymbols.length >= 5) {
      return
    }
    
    // Check if the symbol is already selected
    const isAlreadySelected = selectedSymbols.some(
      s => s.symbol === symbol.symbol && s.region === symbol.region
    )
    
    if (!isAlreadySelected) {
      setSelectedSymbols(prev => [...prev, symbol])
    }
  }

  const removeSymbol = (symbol: SymbolSearchMatch) => {
    setSelectedSymbols(prev => 
      prev.filter(s => !(s.symbol === symbol.symbol && s.region === symbol.region))
    )
  }

  // Toggle function that adds or removes based on current state
  const toggleSymbol = (symbol: SymbolSearchMatch) => {
    const isAlreadySelected = isSymbolSelected(symbol)
    
    if (isAlreadySelected) {
      // If already selected, remove it
      removeSymbol(symbol)
    } else {
      // If not selected and we're below limit, add it
      if (selectedSymbols.length < 5) {
        addSymbol(symbol)
      }
      // If at limit, do nothing (the calling code will show an error message)
    }
  }

  const clearSymbols = () => {
    setSelectedSymbols([])
  }

  const isSymbolSelected = (symbol: SymbolSearchMatch) => {
    return selectedSymbols.some(
      s => s.symbol === symbol.symbol && s.region === symbol.region
    )
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