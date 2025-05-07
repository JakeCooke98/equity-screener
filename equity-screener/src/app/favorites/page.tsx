'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { RootLayout } from '@/components/layout/root-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { ChevronRight, PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Custom event name - must match the one in FavoritesContext
const FAVORITES_UPDATED_EVENT = 'favoritesUpdated'

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites()
  const router = useRouter()
  
  // Local state to track the symbols to display
  const [displayedSymbols, setDisplayedSymbols] = useState<SymbolSearchMatch[]>([])
  const [updateCounter, setUpdateCounter] = useState(0)
  
  // Sync displayed symbols with favorites
  useEffect(() => {
    // Use a deep clone to ensure we get new reference
    setDisplayedSymbols(JSON.parse(JSON.stringify(favorites)))
  }, [favorites, updateCounter])
  
  // Listen for the custom favorites updated event
  useEffect(() => {
    const handleFavoritesUpdated = () => {
      // Force rerender by incrementing counter
      setUpdateCounter(prev => prev + 1)
    }
    
    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    }
  }, [])
  
  // Check if we're on mobile
  const isSmallScreen = useMediaQuery('(max-width: 1023px)')
  
  // Determine visible columns based on screen size
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'symbol', 'name', 'type', 'region'
  ])
  
  // Update visible columns when screen size changes
  useEffect(() => {
    if (isSmallScreen) {
      setVisibleColumns(['symbol', 'name', 'type', 'region'])
    } else {
      setVisibleColumns(['symbol', 'name', 'ticker', 'type', 'region', 'country', 'currency'])
    }
  }, [isSmallScreen])
  
  // Navigate to stock detail page
  const handleSymbolClick = useCallback((symbol: SymbolSearchMatch) => {
    router.push(`/stock/${symbol.symbol}`)
  }, [router])
  
  // Handle favorite changes with both local and global state updates
  const handleFavoriteChange = useCallback((symbol: SymbolSearchMatch, isFavorited: boolean) => {
    if (!isFavorited) {
      // Update local state immediately for responsive UI
      setDisplayedSymbols(current => 
        current.filter(s => s.symbol !== symbol.symbol)
      )
      
      // Ensure the global state is updated by directly calling removeFavorite
      // This guarantees consistency across the application
      removeFavorite(symbol)
    }
  }, [removeFavorite])
  
  // Handle button clicks without event propagation
  const handleButtonClick = useCallback((e: React.MouseEvent, symbol: SymbolSearchMatch) => {
    e.stopPropagation()
    handleSymbolClick(symbol)
  }, [handleSymbolClick])

  return (
    <RootLayout>
      <div className="py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Page title and description */}
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Watchlist</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Manage your watchlist of stocks and securities
          </p>
        </div>

        <Card>
          <CardHeader className="px-6 pb-3 pt-6">
            <CardTitle>Your Watchlist</CardTitle>
            <CardDescription>
              {displayedSymbols.length === 0
                ? "You haven't added any securities to your watchlist yet."
                : `You have ${displayedSymbols.length} ${displayedSymbols.length === 1 ? 'security' : 'securities'} in your watchlist.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {displayedSymbols.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <CardTitle className="text-xl mb-2">No Securities in Watchlist</CardTitle>
                <CardDescription className="max-w-md mb-6">
                  Add securities to your watchlist to quickly access them later.
                </CardDescription>
                <Button asChild>
                  <Link href="/">Search Securities</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      {visibleColumns.includes('symbol') && (
                        <TableHead className="whitespace-nowrap">Ticker</TableHead>
                      )}
                      {visibleColumns.includes('name') && (
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                      )}
                      {visibleColumns.includes('ticker') && (
                        <TableHead className="whitespace-nowrap">ID</TableHead>
                      )}
                      {visibleColumns.includes('type') && (
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                      )}
                      {visibleColumns.includes('region') && (
                        <TableHead className="whitespace-nowrap">Region</TableHead>
                      )}
                      {visibleColumns.includes('country') && (
                        <TableHead className="whitespace-nowrap">Country</TableHead>
                      )}
                      {visibleColumns.includes('currency') && (
                        <TableHead className="whitespace-nowrap">Currency</TableHead>
                      )}
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedSymbols.map((symbol) => (
                      <TableRow 
                        key={`${symbol.symbol}-${updateCounter}`} 
                        className="cursor-pointer group hover:bg-muted/50"
                        onClick={() => handleSymbolClick(symbol)}
                      >
                        <TableCell className="w-10 p-2">
                          <FavoriteButton 
                            symbol={symbol} 
                            size="sm"
                            showTooltip={false}
                            className="hover:bg-transparent"
                            onFavoriteChange={handleFavoriteChange}
                          />
                        </TableCell>
                        
                        {visibleColumns.includes('symbol') && (
                          <TableCell className="px-6 py-4 font-medium text-primary">
                            {symbol.symbol || 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('name') && (
                          <TableCell className="px-6 py-4 max-w-xs truncate">
                            {symbol.name || 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('ticker') && (
                          <TableCell className="px-6 py-4">
                            {symbol.symbol ? `${symbol.symbol}.${symbol.region || 'UNK'}` : 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('type') && (
                          <TableCell className="px-6 py-4">
                            {symbol.type || 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('region') && (
                          <TableCell className="px-6 py-4">
                            {symbol.region || 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('country') && (
                          <TableCell className="px-6 py-4">
                            {symbol.country || symbol.region || 'Unknown'}
                          </TableCell>
                        )}
                        
                        {visibleColumns.includes('currency') && (
                          <TableCell className="px-6 py-4">
                            {symbol.currency || 'Unknown'}
                          </TableCell>
                        )}
                        
                        <TableCell className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0" 
                            onClick={(e) => handleButtonClick(e, symbol)}
                            title={`View ${symbol.symbol} details`}
                          >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RootLayout>
  )
} 