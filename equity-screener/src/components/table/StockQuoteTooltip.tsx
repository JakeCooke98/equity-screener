'use client'

import { useEffect, CSSProperties } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useStockQuote } from '@/hooks/useStockQuote'
import { cn } from '@/lib/utils'

interface StockQuoteTooltipProps {
  symbol: string
  className?: string
  isVisible: boolean
  style?: CSSProperties
  isAbove?: boolean
}

export function StockQuoteTooltip({ 
  symbol, 
  className,
  isVisible,
  style,
  isAbove = false
}: StockQuoteTooltipProps) {
  const { data, isLoading, error, fetchQuote } = useStockQuote(symbol)

  // Fetch data when tooltip becomes visible
  useEffect(() => {
    if (isVisible && !data && !isLoading) {
      fetchQuote()
    }
  }, [isVisible, data, isLoading, fetchQuote, symbol])

  // Format price with two decimal places and appropriate locale
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Format change percentage
  const formatPercent = (percent: number) => {
    return percent.toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always'
    })
  }

  // Get color classes based on positive/negative change
  const getChangeColorClass = (percent: number) => {
    return percent >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card 
      className={cn(
        'p-4 shadow-lg border-2 w-64 relative', 
        isAbove 
          ? 'animate-in fade-in-50 slide-in-from-bottom-2 duration-150' 
          : 'animate-in fade-in-50 slide-in-from-top-2 duration-150',
        className
      )}
      style={style}
    >
      {/* Arrow that points to the row - direction changes based on position */}
      {isAbove ? (
        // Downward pointing arrow when tooltip is above the row
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-background border-r-2 border-b-2 border-border/50"
          aria-hidden="true"
        />
      ) : (
        // Upward pointing arrow when tooltip is below the row
        <div 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-background border-t-2 border-l-2 border-border/50"
          aria-hidden="true"
        />
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{symbol}</h4>
          {isLoading && !data && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {error && (
          <p className="text-sm text-red-600">Failed to load quote data</p>
        )}

        {isLoading && !data && (
          <p className="text-sm text-muted-foreground">Loading quote data...</p>
        )}

        {data && !error && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Last Price</span>
              <span className="font-semibold">{formatPrice(data.price)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Change</span>
              <span className={cn(
                'font-medium',
                getChangeColorClass(data.changePercent)
              )}>
                {formatPercent(data.changePercent / 100)}
              </span>
            </div>
            
            <div className="h-px w-full bg-border my-1" />
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">52W High</span>
              <span className="font-medium">{formatPrice(data.high52Week)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">52W Low</span>
              <span className="font-medium">{formatPrice(data.low52Week)}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  )
} 