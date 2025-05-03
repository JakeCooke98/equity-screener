'use client'

import { useState } from 'react'
import { SymbolSearch } from '@/components/search/SymbolSearch'
import { SymbolSearchMatch } from '@/services/alphaVantage'

export function SearchContainer() {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolSearchMatch | null>(null)

  const handleSelectSymbol = (symbol: SymbolSearchMatch) => {
    setSelectedSymbol(symbol)
    console.log('Selected symbol:', symbol)
    // You can add more logic here to handle the selection
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <h2 className="text-xl font-semibold">Search Securities</h2>
      <SymbolSearch onSelectSymbol={handleSelectSymbol} />
      <p className="text-sm text-muted-foreground">
        Search by ticker symbol, company name, or keyword
      </p>
      
      {selectedSymbol && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-medium">{selectedSymbol.symbol} - {selectedSymbol.name}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedSymbol.type} • {selectedSymbol.region}
          </p>
        </div>
      )}
    </div>
  )
} 