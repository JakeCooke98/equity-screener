'use client'

import { useState, useEffect, useRef } from 'react'
import { SymbolSearch } from '@/components/search/SymbolSearch'
import { SymbolsTable } from '@/components/table/SymbolsTable'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Info } from 'lucide-react'

export function SearchContainer() {
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSearchMatch[]>([])
  const [searchResults, setSearchResults] = useState<SymbolSearchMatch[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState<{type: 'info' | 'warning' | 'success'; text: string} | null>(null)
  const prevResultsLengthRef = useRef<number>(0);

  // Handle selecting a symbol from the results table
  const handleSelectSymbol = (symbol: SymbolSearchMatch) => {
    // Check if the symbol is already selected
    const isDuplicate = selectedSymbols.some(
      selected => selected.symbol === symbol.symbol && selected.region === symbol.region
    );
    
    if (!isDuplicate) {
      // Add to selected symbols list
      setSelectedSymbols(prev => [...prev, symbol]);
      
      // Show success message
      setMessage({
        type: 'success',
        text: `Added ${symbol.symbol} (${symbol.name || 'Unknown'}) to your selection`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  }

  // Handle search results from the SymbolSearch component
  const handleSearchResults = (results: SymbolSearchMatch[], isLoading: boolean) => {
    // Update search results
    setSearchResults(results);
    setIsSearching(isLoading);
    
    // Using a ref to track previous results length to avoid infinite updates
    const prevLength = prevResultsLengthRef.current;
    prevResultsLengthRef.current = results.length;
    
    // Only show "no results" message when search is completed and length changes from positive to zero
    if (!isLoading && results.length === 0 && prevLength > 0) {
      setMessage({
        type: 'info',
        text: 'No results found. Try a different search term or adjust filters.'
      });
    } else if (results.length > 0 && message?.text?.includes('No results found')) {
      // Clear the "no results" message when we have results again
      setMessage(null);
    }
  }

  // Combine search results with selected symbols for display in the table
  const displayData = [...searchResults];
  
  // Add selected symbols that aren't already in the results
  selectedSymbols.forEach(symbol => {
    const isInResults = displayData.some(
      result => result.symbol === symbol.symbol && result.region === symbol.region
    );
    
    if (!isInResults) {
      displayData.push(symbol);
    }
  });

  // Determine what to show based on state
  const showTable = displayData.length > 0 || isSearching;
  const showEmptyState = !showTable && !message;

  return (
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
        
        {/* Status messages */}
        {message && (
          <Alert 
            variant={message.type === 'warning' ? 'destructive' : 'default'} 
            className={`${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : ''}`}
          >
            {message.type === 'info' && <Info className="h-4 w-4" />}
            {message.type === 'warning' && <AlertCircle className="h-4 w-4" />}
            {message.type === 'success' && <Info className="h-4 w-4 text-green-800" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        
        {/* Table of search results */}
        {showTable && (
          <SymbolsTable 
            data={displayData} 
            isLoading={isSearching}
            onSelectRow={handleSelectSymbol}
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
  )
} 