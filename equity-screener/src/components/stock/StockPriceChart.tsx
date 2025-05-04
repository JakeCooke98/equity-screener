'use client'

import { useState, useCallback, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/lib/formatters'

interface StockPriceChartProps {
  data: Array<{
    date: string
    price: number
  }>
  symbol: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
  }>
  label?: string
}

export function StockPriceChart({ data, symbol }: StockPriceChartProps) {
  // Format date for display
  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [])
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-md text-sm">
          <div className="font-medium">{formatDate(label || '')}</div>
          <div>
            <span className="text-muted-foreground mr-2">Price:</span>
            <span className="font-medium">{formatCurrency(payload[0].value)}</span>
          </div>
        </div>
      )
    }
    return null
  }
  
  // Calculate min and max price for Y axis domain with padding
  const prices = data.map(item => item.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice
  const paddingFactor = 0.1 // 10% padding
  
  const yDomain = useMemo(() => [
    minPrice - range * paddingFactor,
    maxPrice + range * paddingFactor
  ], [minPrice, maxPrice, range, paddingFactor])
  
  // Format y-axis ticks
  const formatYAxisTick = useCallback((value: number) => {
    if (maxPrice < 10) {
      // For small prices (< $10), show 2 decimal places
      return value.toFixed(2)
    } else if (maxPrice < 100) {
      // For medium prices ($10 - $100), show 1 decimal place
      return value.toFixed(1)
    } else {
      // For large prices (> $100), show whole numbers
      return value.toFixed(0)
    }
  }, [maxPrice])
  
  // Get price change information
  const firstPrice = data.length > 0 ? data[0].price : 0
  const lastPrice = data.length > 0 ? data[data.length - 1].price : 0
  const priceChange = lastPrice - firstPrice
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0
  const isPriceUp = priceChange >= 0
  
  // Determine line color based on price direction
  const lineColor = isPriceUp ? '#16a34a' : '#dc2626'
  
  return (
    <div className="w-full h-full">
      {/* Price change summary */}
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm font-medium">{symbol}</div>
        <div className={`text-sm font-medium flex items-center ${isPriceUp ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(priceChange)}
          <span className="ml-2">
            ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 100, 100, 0.1)" />
          <XAxis 
            dataKey="date"
            tickFormatter={(tick) => {
              const date = new Date(tick)
              return date.toLocaleDateString('en-US', { month: 'short' })
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yDomain}
            tickFormatter={formatYAxisTick}
            tick={{ fontSize: 12 }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={firstPrice} stroke="rgba(100, 100, 100, 0.5)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            activeDot={{ r: 6 }}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 