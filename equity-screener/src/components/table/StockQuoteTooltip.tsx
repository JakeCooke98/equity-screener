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
  const formatPrice = (price: number | undefined | null) => {
    // Handle null/undefined values
    if (price === undefined || price === null) {
      return '$0.00';
    }
    
    // Handle NaN values
    if (isNaN(price)) {
      return '$0.00';
    }
    
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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

  // Don't render anything if not visible to improve performance
  if (!isVisible) {
    return null
  }

  // Determine minimum height based on content
  const minHeightClass = isLoading && !data ? 'min-h-[100px]' : 'min-h-[180px]'

  return (
    <Card 
      className={cn(
        'p-4 w-64 shadow-lg',
        minHeightClass,
        'animate-in fade-in-0 zoom-in-95 duration-150',
        isAbove ? 'origin-bottom' : 'origin-top',
        className
      )}
      style={style}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{symbol}</h4>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center h-16 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              Could not load data for this symbol
            </p>
          </div>
        ) : isLoading && !data ? (
          <div className="flex flex-col items-center justify-center h-16 mt-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50 mb-2" />
            <p className="text-sm text-muted-foreground">Loading quote data...</p>
          </div>
        ) : data ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center h-16 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              No data available
            </p>
          </div>
        )}
      </div>
    </Card>
  )
} 