'use client'

import { useSymbols } from '@/contexts/SymbolsContext'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartBarIcon, ChartLineIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SymbolChips } from './SymbolChips'
import { ComparisonChart } from './ComparisonChart'
import { alphaVantageService, TimeSeriesData } from '@/services/alphaVantage/index'
import { ErrorMessage } from '@/components/ui/error-message'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingIndicator } from '@/components/ui/loading-indicator'

type ChartType = 'line' | 'bar'

export function DashboardContent() {
  const { selectedSymbols, clearSymbols } = useSymbols()
  const [chartType, setChartType] = useState<ChartType>('line')
  const [isLoading, setIsLoading] = useState(false)
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, TimeSeriesData>>({})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch time series data for selected symbols
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have at least one symbol selected
      if (selectedSymbols.length === 0) {
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Create a new object to store the results
        const newData: Record<string, TimeSeriesData> = {}
        
        // Fetch data for each symbol
        for (const symbol of selectedSymbols) {
          // Skip if we already have data for this symbol
          if (timeSeriesData[symbol.symbol]) {
            newData[symbol.symbol] = timeSeriesData[symbol.symbol]
            continue
          }
          
          try {
            const data = await alphaVantageService.fetchTimeSeriesData(symbol.symbol)
            newData[symbol.symbol] = data
          } catch (err) {
            console.error(`Error fetching data for ${symbol.symbol}:`, err)
            // Continue with other symbols even if one fails
          }
        }
        
        setTimeSeriesData(prevData => ({
          ...prevData,
          ...newData
        }))
      } catch (err) {
        console.error('Error fetching time series data:', err)
        setError('Failed to fetch price data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [selectedSymbols])

  // Process the time series data into the format needed for charts
  const processChartData = () => {
    // Check if we have data for the selected symbols
    const hasData = selectedSymbols.some(symbol => timeSeriesData[symbol.symbol])
    
    // Return empty array if we're still loading or missing data
    if (isLoading || !hasData) {
      return []
    }
    
    // Get all unique dates from all symbols
    const allDates = new Set<string>()
    selectedSymbols.forEach(symbol => {
      if (timeSeriesData[symbol.symbol]) {
        timeSeriesData[symbol.symbol].dataPoints.forEach(point => {
          // Convert date to string format for consistency
          allDates.add(point.date.toISOString().split('T')[0])
        })
      }
    })
    
    // Sort dates in ascending order
    const sortedDates = Array.from(allDates).sort()
    
    // Create data points for each date
    return sortedDates.map(date => {
      const dataPoint: Record<string, any> = {
        name: formatDate(date)
      }
      
      // Add close price for each symbol
      selectedSymbols.forEach(symbol => {
        if (timeSeriesData[symbol.symbol]) {
          const point = timeSeriesData[symbol.symbol].dataPoints.find(p => 
            p.date.toISOString().split('T')[0] === date
          )
          if (point) {
            // Ensure price is a valid number
            const price = typeof point.close === 'number' ? point.close : parseFloat(point.close as any)
            
            // Only add valid numbers to avoid chart display issues
            if (!isNaN(price) && isFinite(price)) {
              // Format to 2 decimal places for consistency
              dataPoint[symbol.symbol] = parseFloat(price.toFixed(2))
            }
          }
        }
      })
      
      return dataPoint
    })
  }
  
  // Format date from YYYY-MM-DD to MMM YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const chartData = processChartData()

  // Check if we have any symbols selected and data to display
  const hasSymbols = selectedSymbols.length > 0
  const hasMaxSymbols = selectedSymbols.length >= 5

  return (
    <div className="space-y-6">
      {/* Symbol selection section */}
      <Card className="w-full">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle>Selected Securities</CardTitle>
          <CardDescription>
            Select up to 5 symbols to compare in the dashboard. Currently selected: {selectedSymbols.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <div className="flex flex-col gap-4">
            <SymbolChips />
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push('/')}
              >
                Add More Symbols
              </Button>
              {selectedSymbols.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSymbols}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart section */}
      {hasSymbols ? (
        <Card className="w-full">
          <CardHeader className="px-6 pb-3 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle>Price Comparison</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <ChartLineIcon className="h-4 w-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Bar
                </Button>
              </div>
            </div>
            <CardDescription>
              Comparing closing prices for selected securities (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <LoadingIndicator 
                size="lg" 
                text="Loading price data..." 
                heightClass="h-92" 
              />
            ) : error ? (
              <ErrorMessage 
                error={error} 
                showRetry={true}
                onRetry={() => {
                  setIsLoading(true);
                  setTimeSeriesData({});
                  setError(null);
                }}
              />
            ) : chartData.length === 0 ? (
              <EmptyState
                title="No price data available"
                description="There is no price data available for the selected symbols."
                type="error"
                heightClass="h-92"
              />
            ) : (
              <ComparisonChart
                data={chartData} 
                type={chartType} 
                symbols={selectedSymbols}
                className="h-92"
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No symbols selected"
          description="Please select at least one symbol to display price charts"
          type="search"
          actionLabel="Search Symbols"
          onAction={() => router.push('/')}
          heightClass="h-60"
        />
      )}
      
      {hasMaxSymbols && (
        <ErrorMessage
          error="Maximum limit reached"
          description="Maximum number of symbols (5) reached for comparison. Remove a symbol to add a different one."
          severity="warning"
        />
      )}
    </div>
  )
} 