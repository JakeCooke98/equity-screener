'use client'

import { SymbolSearchMatch } from '@/services/alphaVantage'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
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
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        {symbols.map((symbol, index) => (
          <div
            key={symbol.symbol}
            className={cn(
              "flex items-center gap-1 cursor-pointer px-2 py-1 rounded transition-colors",
              activeSymbol === symbol.symbol ? "bg-muted" : "hover:bg-muted/50"
            )}
            onMouseEnter={() => setActiveSymbol(symbol.symbol)}
            onMouseLeave={() => setActiveSymbol(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium">{symbol.symbol}</span>
            <span className="text-xs text-muted-foreground">
              {symbol.region}
            </span>
          </div>
        ))}
      </div>
    )
  }, [symbols, activeSymbol])

  // Calculate domain for the YAxis properly
  const allValues = data.flatMap(entry => 
    symbols.map(symbol => entry[symbol.symbol])
  ).filter(value => value !== undefined && value !== null)

  // Calculate min and max with proper padding to avoid edge issues
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  
  // Calculate a reasonable padding based on the range and values
  const range = maxValue - minValue
  let padding: number
  
  if (range === 0) {
    // If all values are the same, create a reasonable range
    padding = Math.max(maxValue * 0.1, 10)
  } else if (range < 1) {
    // For small ranges (less than 1), use a percentage of the max
    padding = Math.max(range * 0.2, maxValue * 0.05)
  } else {
    // For normal ranges, use a percentage of the range
    padding = range * 0.1
  }
  
  // Determine min and max for the y-axis with padding
  const yAxisMin = Math.max(0, minValue - padding) // Never go below 0 for stock prices
  const yAxisMax = maxValue + padding

  // Format y-axis ticks to show proper decimal places
  const formatYAxisTick = (value: number) => {
    if (maxValue < 10) {
      // Use 2 decimal places for small values
      return value.toFixed(2)
    } else if (maxValue < 100) {
      // Use 1 decimal place for medium values
      return value.toFixed(1)
    } else {
      // Use whole numbers for large values
      return value.toFixed(0)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[yAxisMin, yAxisMax]} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatYAxisTick}
              width={60} // Ensure enough space for tick labels
              allowDecimals={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            {symbols.map((symbol, index) => (
              <Line
                key={symbol.symbol}
                type="monotone"
                dataKey={symbol.symbol}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={activeSymbol === symbol.symbol || !activeSymbol ? 2 : 1}
                opacity={activeSymbol === symbol.symbol || !activeSymbol ? 1 : 0.4}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                connectNulls={true}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[yAxisMin, yAxisMax]} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatYAxisTick}
              width={60} // Ensure enough space for tick labels
              allowDecimals={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            {symbols.map((symbol, index) => (
              <Bar
                key={symbol.symbol}
                dataKey={symbol.symbol}
                fill={COLORS[index % COLORS.length]}
                opacity={activeSymbol === symbol.symbol || !activeSymbol ? 1 : 0.4}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
} 