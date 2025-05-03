'use client'

import { useSymbols } from '@/contexts/SymbolsContext'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartBarIcon, ChartLineIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SymbolChips } from './SymbolChips'
import { ComparisonChart } from './ComparisonChart'

type ChartType = 'line' | 'bar'

export function DashboardContent() {
  const { selectedSymbols, clearSymbols } = useSymbols()
  const [chartType, setChartType] = useState<ChartType>('line')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Generate some sample data for the selected symbols
  // In a real app, this would come from an API
  const generateDemoData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data = []

    for (let i = 0; i < 12; i++) {
      const entry: Record<string, any> = {
        name: months[i],
      }

      // Add a value for each selected symbol
      selectedSymbols.forEach(symbol => {
        // Generate a random value between 50 and 200, with some consistency
        // based on the symbol and month to simulate real data patterns
        const baseValue = (symbol.symbol.charCodeAt(0) * 2) % 100 + 50
        const monthInfluence = (i * 5) % 30
        const randomness = Math.random() * 30 - 15
        
        entry[symbol.symbol] = Math.round(baseValue + monthInfluence + randomness)
      })

      data.push(entry)
    }

    return data
  }

  const chartData = generateDemoData()

  // Check if we have enough symbols selected
  const hasMinSymbols = selectedSymbols.length >= 3
  const hasMaxSymbols = selectedSymbols.length >= 5

  return (
    <div className="space-y-6">
      {/* Symbol selection section */}
      <Card className="w-full">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle>Selected Securities</CardTitle>
          <CardDescription>
            Select 3-5 symbols to compare in the dashboard. Currently selected: {selectedSymbols.length}
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
      {hasMinSymbols ? (
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
              Comparing price data for selected securities over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ComparisonChart
                data={chartData} 
                type={chartType} 
                symbols={selectedSymbols}
                className="h-80"
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select at least 3 symbols to display comparison charts
          </AlertDescription>
        </Alert>
      )}
      
      {hasMaxSymbols && (
        <p className="text-sm text-muted-foreground">
          Maximum number of symbols (5) reached for comparison. Remove a symbol to add a different one.
        </p>
      )}
    </div>
  )
} 