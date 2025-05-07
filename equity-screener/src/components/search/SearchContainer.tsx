'use client'

import { useState, useEffect, useRef } from 'react'
import { SymbolSearch } from '@/components/search/SymbolSearch'
import { SymbolsTable } from '@/components/table/SymbolsTable'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSymbols } from '@/contexts/SymbolsContext'
import { MarketNewsPanel } from '@/components/news/MarketNewsPanel'
import { ErrorMessage } from '@/components/ui/error-message'
import { EmptyState } from '@/components/ui/empty-state'

export function SearchContainer() {
  const { toggleSymbol, isSymbolSelected, selectedSymbols } = useSymbols()
  const [searchResults, setSearchResults] = useState<SymbolSearchMatch[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const prevResultsLengthRef = useRef<number>(0)
  
  // Get just the symbol strings from the selectedSymbols objects for the news panel
  const selectedSymbolStrings = selectedSymbols.map(symbol => symbol.symbol)

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
            <ErrorMessage
              error={infoMessage}
              severity="info"
              onDismiss={() => setInfoMessage(null)}
            />
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
            <EmptyState
              title="Start Searching"
              description="Enter a ticker symbol, company name, or keyword in the search box above to find securities."
              type="search"
              heightClass="py-12"
            />
          )}
        </CardContent>
      </Card>
      
      {/* Market News Panel */}
      <MarketNewsPanel selectedSymbols={selectedSymbolStrings.length > 0 ? selectedSymbolStrings : undefined} />
      
      {/* Toast-like error messages in the bottom-right corner */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <ErrorMessage
            error={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            className="shadow-lg"
          />
        </div>
      )}
    </div>
  )
} 