'use client'

import { useSymbols } from '@/contexts/SymbolsContext'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export function SymbolChips() {
  const { selectedSymbols, removeSymbol } = useSymbols()

  if (selectedSymbols.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No symbols selected. Go to the search page to add symbols.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedSymbols.map((symbol) => (
        <Badge 
          key={`${symbol.symbol}-${symbol.region}`}
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 flex items-center gap-2 bg-muted hover:bg-muted"
        >
          <span className="font-medium">{symbol.symbol}</span>
          <span className="text-xs text-muted-foreground">
            {symbol.name && symbol.name.length > 15 
              ? `${symbol.name.substring(0, 15)}...` 
              : symbol.name}
          </span>
          <button 
            className="ml-1 rounded-full hover:bg-background p-0.5"
            onClick={() => removeSymbol(symbol)}
            aria-label={`Remove ${symbol.symbol}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
} 