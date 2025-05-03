'use client'

import { useState, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)
  const [sorting, setSorting] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  
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

  // Row selection handler
  const handleRowClick = (symbol: SymbolSearchMatch, index: number) => {
    setSelectedRowIndex(index)
    if (onSelectRow) {
      onSelectRow(symbol)
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
          onClick={() => handleRowClick(symbol, index)}
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
              onClick={(e) => {
                e.stopPropagation()
                handleRowClick(symbol, index)
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Add</span>
            </Button>
          </TableCell>
        </TableRow>
      )
    })
  }

  return (
    <div className={cn(className)}>
      <div className="rounded-md border shadow-sm">
        {isSmallScreen && (
          <div className="p-2 border-b bg-muted/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setVisibleColumns(['symbol', 'name', 'type', 'region'])}>
                  Basic Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibleColumns(['symbol', 'name', 'country', 'currency'])}>
                  Location & Currency
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibleColumns(['symbol', 'ticker', 'matchScore', 'type'])}>
                  Tickers & Scores
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <div className="overflow-x-auto">
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
    </div>
  )
} 