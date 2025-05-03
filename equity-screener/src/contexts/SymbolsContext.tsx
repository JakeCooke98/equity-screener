'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { SymbolSearchMatch } from '@/services/alphaVantage'

interface SymbolsContextType {
  selectedSymbols: SymbolSearchMatch[]
  addSymbol: (symbol: SymbolSearchMatch) => void
  removeSymbol: (symbol: SymbolSearchMatch) => void
  clearSymbols: () => void
  isSymbolSelected: (symbol: SymbolSearchMatch) => boolean
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
        isSymbolSelected 
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