'use client'

import { useState, useEffect, useRef } from 'react'
import { SymbolSearch } from '@/components/search/SymbolSearch'
import { SymbolsTable } from '@/components/table/SymbolsTable'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Info, X } from 'lucide-react'
import { useSymbols } from '@/contexts/SymbolsContext'
import { MarketNewsPanel } from '@/components/news/MarketNewsPanel'

export function SearchContainer() {
  const { toggleSymbol, isSymbolSelected, selectedSymbols } = useSymbols()
  const [searchResults, setSearchResults] = useState<SymbolSearchMatch[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const prevResultsLengthRef = useRef<number>(0)
  
  // Track selected rows in the table for news filtering
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Handle selecting a symbol from the results table
  const handleSelectSymbol = (symbol: SymbolSearchMatch) => {
    // Check if we're at the maximum limit and trying to add a new symbol
    if (selectedSymbols.length >= 5 && !isSymbolSelected(symbol)) {
      // Show error message in toast
      setErrorMessage(`Maximum limit reached (5 symbols). Remove a symbol before adding another.`)
      
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }
    
    // Toggle the symbol without showing messages for success/removal
    toggleSymbol(symbol)
    
    // Update selected rows for news filtering
    updateSelectedRows(symbol)
  }
  
  // Update the selectedRows array when a row is selected
  const updateSelectedRows = (symbol: SymbolSearchMatch) => {
    if (selectedRows.includes(symbol.symbol)) {
      setSelectedRows(prevSelected => prevSelected.filter(s => s !== symbol.symbol))
    } else {
      // Keep only the most recent 3 selections for better news relevance
      setSelectedRows(prevSelected => [...prevSelected, symbol.symbol].slice(-3))
    }
  }

  // Handle search results from the SymbolSearch component
  const handleSearchResults = (results: SymbolSearchMatch[], isLoading: boolean) => {
    // Update search results
    setSearchResults(results)
    setIsSearching(isLoading)
    
    // Using a ref to track previous results length to avoid infinite updates
    const prevLength = prevResultsLengthRef.current
    prevResultsLengthRef.current = results.length
    
    // Only show "no results" message when search is completed and length changes from positive to zero
    if (!isLoading && results.length === 0 && prevLength > 0) {
      setInfoMessage('No results found. Try a different search term or adjust filters.')
    } else if (results.length > 0 && infoMessage?.includes('No results found')) {
      // Clear the "no results" message when we have results again
      setInfoMessage(null)
    }
  }

  // Determine what to show based on state
  const showTable = searchResults.length > 0 || isSearching
  const showEmptyState = !showTable && !infoMessage

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle>Search Securities</CardTitle>
          <CardDescription>
            Search by ticker symbol, company name, or keyword
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <SymbolSearch 
            onSelectSymbol={handleSelectSymbol} 
            onSearchResults={handleSearchResults}
          />
          
          {/* Info message within the card (for search-related messages) */}
          {infoMessage && (
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* Table of search results */}
          {showTable && (
            <SymbolsTable 
              data={searchResults} 
              isLoading={isSearching}
              onSelectRow={handleSelectSymbol}
              isRowSelected={isSymbolSelected}
              className="border-none shadow-none p-0 bg-transparent"
            />
          )}
          
          {/* Empty state when nothing has been searched yet */}
          {showEmptyState && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <CardTitle className="text-xl mb-2">Start Searching</CardTitle>
              <CardDescription className="max-w-md">
                Enter a ticker symbol, company name, or keyword in the search box above to find securities.
              </CardDescription>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Market News Panel */}
      <MarketNewsPanel selectedSymbols={selectedRows.length > 0 ? selectedRows : undefined} />
      
      {/* Toast-like error messages in the bottom-right corner */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Alert 
            variant="destructive" 
            className="bg-red-50 text-red-800 border-red-200 shadow-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex-1">{errorMessage}</AlertDescription>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Alert>
        </div>
      )}
    </div>
  )
} 