'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { StockQuoteTooltip } from './StockQuoteTooltip'
import { useRouter } from 'next/navigation'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { SkeletonSymbolTable } from '@/components/ui/skeleton'

interface SymbolsTableProps {
  data: SymbolSearchMatch[]
  isLoading?: boolean
  onSelectRow?: (symbol: SymbolSearchMatch) => void
  isRowSelected?: (symbol: SymbolSearchMatch) => boolean
  className?: string
  onRowClick?: (symbol: SymbolSearchMatch) => void
  selectedRowIndex?: number
  onToggleSelection?: (symbol: SymbolSearchMatch, index: number, event: React.MouseEvent) => void
}

export function SymbolsTable({ 
  data, 
  isLoading = false,
  onSelectRow,
  isRowSelected,
  className,
  onRowClick,
  selectedRowIndex,
  onToggleSelection
}: SymbolsTableProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
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
    'favorite', 'symbol', 'name', 'type', 'region'
  ])
  
  // Update visible columns based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setVisibleColumns(['favorite', 'symbol', 'name', 'type', 'region'])
    } else {
      setVisibleColumns(['favorite', 'symbol', 'name', 'ticker', 'type', 'region', 'country', 'currency', 'matchScore'])
    }
  }, [isSmallScreen])

  // Define items per page
  const itemsPerPage = 10
  
  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1)
    setLocalSelectedIndex(null)
  }, [data])

  // Memoize sorted data to prevent unnecessary recalculations
  const sortedData = useMemo(() => {
    if (!sorting) return data
    
    return [...data].sort((a, b) => {
      const aValue = a[sorting.column as keyof SymbolSearchMatch] || ''
      const bValue = b[sorting.column as keyof SymbolSearchMatch] || ''
      
      if (sorting.column === 'matchScore') {
        const aScore = parseFloat(aValue as string) || 0
        const bScore = parseFloat(bValue as string) || 0
        return sorting.direction === 'asc' ? aScore - bScore : bScore - aScore
      }
      
      const aStr = aValue.toString().toLowerCase()
      const bStr = bValue.toString().toLowerCase()
      
      return sorting.direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sorting])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage))

  // Memoize current page data and indices
  const { currentData, startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = Math.min(start + itemsPerPage, sortedData.length)
    return {
      currentData: sortedData.slice(start, end),
      startIndex: start,
      endIndex: end
    }
  }, [sortedData, currentPage, itemsPerPage])

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  
  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setLocalSelectedIndex(null)
    }
  }
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setLocalSelectedIndex(null)
    }
  }

  // Row selection handler (for dashboard chart selection)
  const handleToggleSelection = (symbol: SymbolSearchMatch, index: number, event: React.MouseEvent) => {
    // Make sure the event doesn't propagate to the row click handler
    event.stopPropagation()
    
    // Update the local selected row state
    setLocalSelectedIndex(isRowSelected && isRowSelected(symbol) ? null : index)
    
    // Call the onSelectRow handler if provided
    if (onSelectRow) {
      onSelectRow(symbol)
    }

    if (onToggleSelection) {
      onToggleSelection(symbol, index, event)
    }
  }
  
  // Handle row click to navigate to stock detail page
  const handleRowClick = (symbol: SymbolSearchMatch) => {
    // Navigate to stock detail page using the symbol
    router.push(`/stock/${symbol.symbol}`)

    if (onRowClick) {
      onRowClick(symbol)
    }
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
    if (currentData.length === 0 && !isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={visibleColumns.length + 2} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      );
    }

    return currentData.map((symbol, rowIndex) => {
      const isSelected = isRowSelected ? isRowSelected(symbol) : selectedRowIndex === rowIndex || localSelectedIndex === rowIndex;
      
      return (
        <TableRow 
          key={`${symbol.symbol}-${rowIndex}`}
          className={cn(
            "cursor-pointer group",
            isSelected ? "bg-primary/10" : "hover:bg-muted/50"
          )}
          onClick={() => handleRowClick(symbol)}
          onMouseEnter={(e) => handleRowMouseEnter(e, symbol.symbol)}
          onMouseLeave={handleRowMouseLeave}
        >
          {/* Favorite button column */}
          <TableCell className="w-10 p-2">
            <FavoriteButton 
              symbol={symbol} 
              size="sm"
              showTooltip={false}
              className="hover:bg-transparent"
            />
          </TableCell>
          
          {/* Symbol column */}
          {visibleColumns.includes('symbol') && (
            <TableCell className="px-6 py-4 font-medium text-primary">
              {symbol.symbol || 'Unknown'}
            </TableCell>
          )}
           
          {/* Name column */}
          {visibleColumns.includes('name') && (
            <TableCell className="px-6 py-4 max-w-xs truncate">
              {symbol.name || 'Unknown'}
            </TableCell>
          )}
           
          {/* Ticker column */}
          {visibleColumns.includes('ticker') && (
            <TableCell className="px-6 py-4">
              {symbol.symbol ? `${symbol.symbol}.${symbol.region || 'UNK'}` : 'Unknown'}
            </TableCell>
          )}
           
          {/* Type column */}
          {visibleColumns.includes('type') && (
            <TableCell className="px-6 py-4">
              {symbol.type || 'Unknown'}
            </TableCell>
          )}
           
          {/* Region column */}
          {visibleColumns.includes('region') && (
            <TableCell className="px-6 py-4">
              {symbol.region || 'Unknown'}
            </TableCell>
          )}
           
          {/* Country column */}
          {visibleColumns.includes('country') && (
            <TableCell className="px-6 py-4">
              {symbol.region || 'Unknown'}
            </TableCell>
          )}
           
          {/* Currency column */}
          {visibleColumns.includes('currency') && (
            <TableCell className="px-6 py-4">
              {symbol.currency || 'Unknown'}
            </TableCell>
          )}
           
          {/* Match score column */}
          {visibleColumns.includes('matchScore') && (
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${parseFloat(String(symbol.matchScore || '0')) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs">
                  {(parseFloat(String(symbol.matchScore || '0')) * 100).toFixed(0)}%
                </span>
              </div>
            </TableCell>
          )}
          
          {/* Action button for dashboard add/remove */}
          <TableCell className="px-6 py-4 text-right">
            <Button 
              size="sm" 
              variant={isSelected ? "default" : "ghost"}
              className="h-7 w-7 p-0" 
              onClick={(e) => handleToggleSelection(symbol, rowIndex, e)}
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
      );
    });
  }

  // Show the skeleton loader when data is loading
  if (isLoading && data.length === 0) {
    return <SkeletonSymbolTable rows={itemsPerPage} />;
  }

  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Favorite column header */}
            <TableHead className="w-10 p-2"></TableHead>
            
            {/* Filter visible columns to exclude the favorite column */}
            {visibleColumns.filter(col => col !== 'favorite').map((column) => (
              <TableHead 
                key={column}
                className={cn(
                  "whitespace-nowrap",
                  // Additional classes for specific columns
                )}
                onClick={() => handleSort(column)}
              >
                <span className="flex items-center cursor-pointer">
                  {column === 'symbol' ? 'Ticker' :
                   column === 'ticker' ? 'ID' :
                   column === 'matchScore' ? 'Relevance' :
                   column.charAt(0).toUpperCase() + column.slice(1)}
                  {getSortIcon(column)}
                </span>
              </TableHead>
            ))}
            
            {/* Action column header */}
            <TableHead className="w-10 p-2 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderRows()}
        </TableBody>
      </Table>
      
      {/* Pagination controls */}
      {data.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
      
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
    </div>
  );
} 