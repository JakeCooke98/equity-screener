'use client'

import { SymbolSearchMatch } from '@/services/alphaVantage/index'
import { cn } from '@/lib/utils'
import { useState, useCallback, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

// Define a set of colors for the chart lines
const COLORS = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
]

interface ComparisonChartProps {
  data: any[]
  type: 'line' | 'bar'
  symbols: SymbolSearchMatch[]
  className?: string
}

export function ComparisonChart({ data, type, symbols, className }: ComparisonChartProps) {
  // Track the active symbol in the chart
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)
  
  // Simple zoom state - we only track which months to display
  const [visibleStartIndex, setVisibleStartIndex] = useState<number>(0)
  const [visibleEndIndex, setVisibleEndIndex] = useState<number>(data.length - 1)
  
  // Calculate if we're zoomed in
  const isZoomed = visibleStartIndex > 0 || visibleEndIndex < data.length - 1
  
  // Memoized visible data slice
  const visibleData = useMemo(() => {
    return data.slice(visibleStartIndex, visibleEndIndex + 1)
  }, [data, visibleStartIndex, visibleEndIndex])
  
  // Zoom to specific range of months
  const handleZoom = useCallback((rangeSize: number) => {
    // Default to the most recent months when zooming in
    const end = data.length - 1
    const start = Math.max(0, end - rangeSize + 1)
    
    setVisibleStartIndex(start)
    setVisibleEndIndex(end)
  }, [data.length])
  
  // Move the visible window left or right
  const handlePan = useCallback((direction: 'left' | 'right') => {
    const currentSize = visibleEndIndex - visibleStartIndex + 1
    
    if (direction === 'left') {
      // Move window left (earlier in time)
      const newStart = Math.max(0, visibleStartIndex - 1)
      const newEnd = newStart + currentSize - 1
      setVisibleStartIndex(newStart)
      setVisibleEndIndex(newEnd)
    } else {
      // Move window right (later in time)
      const newEnd = Math.min(data.length - 1, visibleEndIndex + 1)
      const newStart = newEnd - currentSize + 1
      setVisibleStartIndex(Math.max(0, newStart))
      setVisibleEndIndex(newEnd)
    }
  }, [visibleStartIndex, visibleEndIndex, data.length])
  
  // Reset zoom to show all data
  const resetZoom = useCallback(() => {
    setVisibleStartIndex(0)
    setVisibleEndIndex(data.length - 1)
  }, [data.length])

  // Custom tooltip component
  const CustomTooltip = useCallback(
    ({ active, payload, label }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) {
        return null
      }

      // Find matching values to highlight when they are the same
      const values = payload.map(entry => entry.value)
      const matchingValues = values.filter(
        (value, index, self) => self.indexOf(value) !== index
      )

      return (
        <Card className="p-3 border shadow-sm">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => {
            // Find the symbol info by matching with the entry name
            const symbolInfo = symbols.find(s => s.symbol === entry.name)
            const isMatching = matchingValues.includes(entry.value as number)

            return (
              <div 
                key={`tooltip-${entry.name}`} 
                className={cn(
                  "flex items-center gap-2 py-1",
                  isMatching && "font-medium"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">{entry.name}</span>
                <span className="text-sm text-muted-foreground">
                  {symbolInfo?.type || 'Unknown'}
                </span>
                <span 
                  className={cn(
                    "ml-auto font-mono",
                    isMatching && "bg-green-100 px-1 rounded text-green-800"
                  )}
                >
                  {typeof entry.value === 'number' 
                    ? entry.value.toFixed(2) 
                    : entry.value}
                </span>
              </div>
            )
          })}
        </Card>
      )
    },
    [symbols]
  )

  // Handle mouse events for highlighting specific symbols
  const handleMouseEnter = useCallback((entry: any) => {
    setActiveSymbol(entry.dataKey)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setActiveSymbol(null)
  }, [])

  // Create custom legend items
  const renderLegend = useCallback(() => {
    return (
      <div className="flex flex-wrap justify-center gap-2 pb-1">
        {symbols.map((symbol, index) => (
          <div
            key={symbol.symbol}
            className={cn(
              "flex items-center gap-1 cursor-pointer px-2 py-1 rounded transition-colors text-xs",
              activeSymbol === symbol.symbol ? "bg-muted" : "hover:bg-muted/50"
            )}
            onMouseEnter={() => setActiveSymbol(symbol.symbol)}
            onMouseLeave={() => setActiveSymbol(null)}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium">{symbol.symbol}</span>
            <span className="text-xs text-muted-foreground hidden md:inline">
              {symbol.region}
            </span>
          </div>
        ))}
      </div>
    )
  }, [symbols, activeSymbol])

  // Memoize expensive calculations for Y-axis
  const { yMin, yMax } = useMemo(() => {
    // Only calculate based on visible data for proper Y-axis scaling
    const allValues = visibleData.flatMap(entry => 
      symbols.map(symbol => entry[symbol.symbol])
    ).filter(value => value !== undefined && value !== null);

    if (allValues.length === 0) {
      return { yMin: 0, yMax: 100 };
    }

    // Calculate min and max with proper padding
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.1, 1);
    
    return { 
      yMin: Math.max(0, minValue - padding), 
      yMax: maxValue + padding
    };
  }, [visibleData, symbols]);

  // Format y-axis ticks to show proper decimal places
  const formatYAxisTick = useCallback((value: number) => {
    if (yMax < 10) {
      // Use 2 decimal places for small values
      return value.toFixed(2);
    } else if (yMax < 100) {
      // Use 1 decimal place for medium values
      return value.toFixed(1);
    } else {
      // Use whole numbers for large values
      return value.toFixed(0);
    }
  }, [yMax]);

  // Get descriptive date ranges for zoom buttons
  const getDateRangeDescription = (months: number) => {
    if (months === 3) return "3 Months";
    if (months === 6) return "6 Months";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* Chart controls - zoom buttons and panning */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {isZoomed ? (
            <span>Showing {visibleData.length} of {data.length} months</span>
          ) : (
            <span>Showing all {data.length} months</span>
          )}
        </div>
        
        <div className="flex gap-1">
          {/* Zoom presets */}
          {data.length > 3 && (
            <div className="flex gap-1">
              {[3, 6, 12].map((months) => (
                months < data.length && (
                  <Button
                    key={months}
                    size="sm"
                    variant={visibleData.length === months ? "default" : "outline"}
                    onClick={() => handleZoom(months)}
                    className="h-7 text-xs"
                  >
                    {getDateRangeDescription(months)}
                  </Button>
                )
              ))}
            </div>
          )}
          
          {/* Reset zoom */}
          {isZoomed && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={resetZoom} 
              className="h-7 gap-1 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              All
            </Button>
          )}
        </div>
      </div>
      
      {/* Main chart container */}
      <div className="w-full flex-grow flex flex-col">
        {/* Chart container with precise margins for perfect centering */}
        <div className="relative w-full flex-grow min-h-[280px] max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart 
                data={visibleData}
                margin={{ top: 5, right: 32, left: 32, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  height={20}
                />
                <YAxis 
                  domain={[yMin, yMax]} 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={formatYAxisTick}
                  width={48}
                  allowDecimals={true}
                />
                
                <Tooltip 
                  content={<CustomTooltip />} 
                  isAnimationActive={false}
                />
                
                <Legend content={renderLegend} />
                
                {symbols.map((symbol, index) => (
                  <Line
                    key={symbol.symbol}
                    type="monotone"
                    dataKey={symbol.symbol}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={activeSymbol === symbol.symbol || !activeSymbol ? 2 : 1.5}
                    opacity={activeSymbol === symbol.symbol || !activeSymbol ? 1 : 0.6}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    connectNulls={true}
                    animationDuration={300}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart 
                data={visibleData}
                margin={{ top: 5, right: 32, left: 32, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  height={20}
                />
                <YAxis 
                  domain={[yMin, yMax]} 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={formatYAxisTick}
                  width={48}
                  allowDecimals={true}
                />
                
                <Tooltip 
                  content={<CustomTooltip />} 
                  isAnimationActive={false}
                />
                
                <Legend content={renderLegend} />
                
                {symbols.map((symbol, index) => (
                  <Bar
                    key={symbol.symbol}
                    dataKey={symbol.symbol}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeSymbol === symbol.symbol || !activeSymbol ? 1 : 0.7}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    animationDuration={300}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Pan controls - moved below the legend */}
        {isZoomed && (
          <div className="flex justify-center gap-2 mt-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePan('left')}
              disabled={visibleStartIndex <= 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePan('right')}
              disabled={visibleEndIndex >= data.length - 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 