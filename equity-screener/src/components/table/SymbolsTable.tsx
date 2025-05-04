'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { StockQuoteTooltip } from './StockQuoteTooltip'
import { useRouter } from 'next/navigation'

interface SymbolsTableProps {
  data: SymbolSearchMatch[]
  isLoading?: boolean
  onSelectRow?: (symbol: SymbolSearchMatch) => void
  isRowSelected?: (symbol: SymbolSearchMatch) => boolean
  className?: string
}

export function SymbolsTable({ 
  data, 
  isLoading = false,
  onSelectRow,
  isRowSelected,
  className
}: SymbolsTableProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)
  const [sorting, setSorting] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  
  // State for tooltip
  const [tooltipSymbol, setTooltipSymbol] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    isAbove: boolean;
  }>({ top: 0, left: 0, isAbove: false })
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  
  // Use a timeout ref to delay showing/hiding tooltip
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // When component mounts, add scroll listener to hide tooltip on scroll
  // When component unmounts, clear any pending timeouts and remove scroll listener
  useEffect(() => {
    // Function to hide tooltip on scroll
    const handleScroll = () => {
      if (isTooltipVisible) {
        setIsTooltipVisible(false)
      }
    }
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Clean up function
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isTooltipVisible])
  
  // Use media query to determine if we're on a small screen
  const isSmallScreen = useMediaQuery('(max-width: 1023px)')
  
  // Determine which columns to show based on screen size
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'symbol', 'name', 'type', 'region'
  ])
  
  // Update visible columns based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setVisibleColumns(['symbol', 'name', 'type', 'region'])
    } else {
      setVisibleColumns(['symbol', 'name', 'ticker', 'type', 'region', 'country', 'currency', 'matchScore'])
    }
  }, [isSmallScreen])

  // Define items per page
  const itemsPerPage = 10
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))
  
  // Ensure current page is valid
  if (currentPage > totalPages) {
    setCurrentPage(totalPages)
  }
  
  // Sort data
  const sortedData = sorting 
    ? [...data].sort((a, b) => {
        const aValue = a[sorting.column as keyof SymbolSearchMatch] || ''
        const bValue = b[sorting.column as keyof SymbolSearchMatch] || ''
        
        // For match score, parse as float
        if (sorting.column === 'matchScore') {
          const aScore = parseFloat(aValue as string) || 0
          const bScore = parseFloat(bValue as string) || 0
          return sorting.direction === 'asc' ? aScore - bScore : bScore - aScore
        }
        
        // For other string values
        const aStr = aValue.toString().toLowerCase()
        const bStr = bValue.toString().toLowerCase()
        
        return sorting.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    : data
  
  // Calculate start and end indices for the current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length)
  
  // Get current page data
  const currentData = sortedData.slice(startIndex, endIndex)
  
  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setSelectedRowIndex(null)
    }
  }
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setSelectedRowIndex(null)
    }
  }

  // Row selection handler (for dashboard chart selection)
  const handleToggleSelection = (symbol: SymbolSearchMatch, index: number, event: React.MouseEvent) => {
    // Make sure the event doesn't propagate to the row click handler
    event.stopPropagation()
    
    // Update the local selected row state
    setSelectedRowIndex(isRowSelected && isRowSelected(symbol) ? null : index)
    
    // Call the onSelectRow handler if provided
    if (onSelectRow) {
      onSelectRow(symbol)
    }
  }
  
  // Handle row click to navigate to stock detail page
  const handleRowClick = (symbol: SymbolSearchMatch) => {
    // Navigate to stock detail page using the symbol
    router.push(`/stock/${symbol.symbol}`)
  }
  
  // Sort handler
  const handleSort = (column: string) => {
    if (sorting?.column === column) {
      // Toggle direction if same column
      setSorting({
        column,
        direction: sorting.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      // Default to ascending for new column
      setSorting({
        column,
        direction: 'asc'
      })
    }
  }
  
  // Generate sort icon
  const getSortIcon = (column: string) => {
    if (sorting?.column !== column) {
      return null
    }
    
    return sorting.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />
  }

  // Adjust row hover/tooltip logic
  const handleRowMouseEnter = useCallback((event: React.MouseEvent<HTMLTableRowElement>, symbol: string) => {
    // If we don't have a valid symbol, don't show the tooltip
    if (!symbol) return;
    
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Get row and container dimensions
    const row = event.currentTarget;
    const rowRect = row.getBoundingClientRect();
    const rowCenterX = rowRect.left + rowRect.width / 2;
    
    // Calculate spaces above and below the row
    const spaceBelow = window.innerHeight - rowRect.bottom;
    const spaceAbove = rowRect.top;
    
    // Default tooltip width (used for centering calculations)
    const tooltipWidth = 256; // 16rem/w-64
    
    // Calculate horizontal position with boundaries
    let left = rowCenterX - (tooltipWidth / 2);
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
    
    // Determine if tooltip should go above or below based on available space
    const minNeededSpace = 180; // minimum space needed for tooltip, can be adjusted
    const isAbove = spaceBelow < minNeededSpace && spaceAbove > spaceBelow;
    
    // Calculate vertical position
    let top;
    if (isAbove) {
      // Position above with 8px gap
      top = rowRect.top - 8;
    } else {
      // Position below with 8px gap
      top = rowRect.bottom + 8;
    }
    
    // Update tooltip data and position
    setTooltipPosition({ top, left, isAbove });
    setTooltipSymbol(symbol);
    
    // Show tooltip after a short delay to prevent flickering
    // when quickly moving between rows
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(true);
    }, 50);
  }, []);

  // Handle row hover end to hide tooltip
  const handleRowMouseLeave = () => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }

    // Set a small delay before hiding tooltip 
    // This allows moving between adjacent rows without flickering
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(false)
    }, 150) // Shorter delay for hiding
  }

  // Render the rows with selected state if available
  const renderRows = () => {
    return currentData.map((symbol, index) => {
      // Determine if row is selected based on context or local state
      const isSelected = 
        isRowSelected 
          ? isRowSelected(symbol) 
          : selectedRowIndex === index
      
          
      return (
        <TableRow 
          key={symbol.symbol && symbol.region ? 
            `${symbol.symbol}-${symbol.region}` : 
            `result-${index}`}
          className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''}`}
          onClick={() => handleRowClick(symbol)}
          onMouseEnter={(e) => handleRowMouseEnter(e, symbol.symbol)}
          onMouseLeave={handleRowMouseLeave}
          onTouchStart={(e) => {
            // For touch devices, show tooltip on touch
            // Cast the touch event properly to avoid type errors
            const syntheticEvent = {
              currentTarget: e.currentTarget,
              preventDefault: e.preventDefault,
              stopPropagation: e.stopPropagation
            } as React.MouseEvent<HTMLTableRowElement>;
            
            handleRowMouseEnter(syntheticEvent, symbol.symbol);
          }}
          onTouchEnd={handleRowMouseLeave}
          onTouchCancel={handleRowMouseLeave}
        >
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
          
          {visibleColumns.includes('matchScore') && (
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${parseFloat(symbol.matchScore || '0') * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs">
                  {(parseFloat(symbol.matchScore || '0') * 100).toFixed(0)}%
                </span>
              </div>
            </TableCell>
          )}
          
          <TableCell className="px-6 py-4 text-right">
            <Button 
              size="sm" 
              variant={isSelected ? "default" : "ghost"}
              className="h-7 w-7 p-0" 
              onClick={(e) => handleToggleSelection(symbol, index, e)}
              title={isSelected ? `Remove ${symbol.symbol}` : `Add ${symbol.symbol}`}
            >
              {isSelected ? (
                <MinusCircle className="h-4 w-4" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              <span className="sr-only">{isSelected ? 'Remove' : 'Add'}</span>
            </Button>
          </TableCell>
        </TableRow>
      )
    })
  }

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-auto relative">
        <Table>
          {data.length > 0 && (
            <TableCaption className="px-6 pb-2">
              Showing {startIndex + 1} to {endIndex} of {data.length} results
            </TableCaption>
          )}
          <TableHeader className="bg-muted/50">
            <TableRow>
              {visibleColumns.includes('symbol') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center">
                    Symbol
                    {getSortIcon('symbol')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('name') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Company Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('ticker') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('ticker')}
                >
                  <div className="flex items-center">
                    Bloomberg Ticker
                    {getSortIcon('ticker')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('type') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Asset Class
                    {getSortIcon('type')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('region') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('region')}
                >
                  <div className="flex items-center">
                    Region
                    {getSortIcon('region')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('country') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('country')}
                >
                  <div className="flex items-center">
                    Country
                    {getSortIcon('country')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('currency') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('currency')}
                >
                  <div className="flex items-center">
                    Currency
                    {getSortIcon('currency')}
                  </div>
                </TableHead>
              )}
              
              {visibleColumns.includes('matchScore') && (
                <TableHead 
                  className="px-6 font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort('matchScore')}
                >
                  <div className="flex items-center">
                    Match Score
                    {getSortIcon('matchScore')}
                  </div>
                </TableHead>
              )}
              
              <TableHead className="px-6 w-[80px] text-right font-semibold text-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`loading-${i}`} className="animate-pulse">
                  {visibleColumns.map((column, idx) => (
                    <TableCell key={`loading-${i}-${column}`} className="px-6 py-4">
                      <div className="h-4 w-16 bg-muted rounded"></div>
                    </TableCell>
                  ))}
                  <TableCell className="px-6 py-4 text-right">
                    <div className="h-4 w-8 bg-muted rounded ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : currentData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              renderRows()
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Stock quote tooltip */}
      {tooltipSymbol && tooltipPosition.top && tooltipPosition.left && isTooltipVisible && (
        <StockQuoteTooltip
          symbol={tooltipSymbol}
          isVisible={true}
          className="shadow-xl border border-border/50 max-w-xs fixed"
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: tooltipPosition.isAbove ? 'translateY(-100%)' : 'none',
            zIndex: 1000,
          }}
          isAbove={tooltipPosition.isAbove}
        />
      )}
      
      {/* Pagination */}
      {data.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 pt-2 pb-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 