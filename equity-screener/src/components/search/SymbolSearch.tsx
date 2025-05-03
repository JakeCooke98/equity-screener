'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchIcon, Loader2, FilterIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useSymbolSearch } from '@/hooks/useSymbolSearch'
import { SymbolSearchMatch } from '@/services/alphaVantage'

interface FilterOptions {
  type?: string;
  region?: string;
}

interface SymbolSearchProps {
  onSelectSymbol?: (symbol: SymbolSearchMatch) => void
  placeholder?: string
}

export function SymbolSearch({ 
  onSelectSymbol, 
  placeholder = 'Search for stocks, ETFs, mutual funds...'
}: SymbolSearchProps) {
  // State for the search input and the popover
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  
  // Ref for the input element
  const inputRef = useRef<HTMLInputElement>(null)

  // Use our custom hook for searching symbols
  const { results, isLoading, error } = useSymbolSearch(query, 400)

  // Close the popover when a symbol is selected
  const handleSelect = (symbol: SymbolSearchMatch) => {
    setOpen(false)
    setQuery('')
    onSelectSymbol?.(symbol)
  }

  // Open the popover when the input is focused
  const handleFocus = () => {
    setOpen(true)
  }

  // Apply filters to the results
  const filteredResults = results
    .filter(result => {
      // Filter by type if specified
      if (filters.type && result.type !== filters.type) {
        return false
      }
      
      // Filter by region if specified
      if (filters.region && result.region !== filters.region) {
        return false
      }
      
      return true
    })
    .sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore))

  // Get unique values for filters
  const uniqueTypes = [...new Set(results.map(result => result.type))]
  const uniqueRegions = [...new Set(results.map(result => result.region))]

  // Toggle a type filter
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type === type ? undefined : type
    }))
  }

  // Toggle a region filter
  const toggleRegionFilter = (region: string) => {
    setFilters(prev => ({
      ...prev,
      region: prev.region === region ? undefined : region
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <SearchIcon 
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" 
          aria-hidden="true" 
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search for symbols"
          aria-autocomplete="list"
          aria-controls={open ? 'symbol-search-results' : undefined}
          aria-expanded={open}
        />
        {isLoading && (
          <Loader2 
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" 
            aria-hidden="true"
          />
        )}
      </div>

      {/* Filter options */}
      {results.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* Type filter */}
          {uniqueTypes.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <FilterIcon className="h-3 w-3 mr-2" />
                  Type {filters.type ? `: ${filters.type}` : ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {uniqueTypes.map(type => (
                        <CommandItem
                          key={type}
                          onSelect={() => toggleTypeFilter(type)}
                          className={filters.type === type ? 'bg-muted' : ''}
                        >
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Region filter */}
          {uniqueRegions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <FilterIcon className="h-3 w-3 mr-2" />
                  Region {filters.region ? `: ${filters.region}` : ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {uniqueRegions.map(region => (
                        <CommandItem
                          key={region}
                          onSelect={() => toggleRegionFilter(region)}
                          className={filters.region === region ? 'bg-muted' : ''}
                        >
                          {region}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Clear filters button */}
          {(filters.type || filters.region) && (
            <Button variant="ghost" size="sm" className="h-8" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Search results popover */}
      {(query.length > 0 || isLoading) && (
        <div 
          className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md"
          style={{ width: inputRef.current?.offsetWidth }}
        >
          <Command>
            {error ? (
              <CommandEmpty className="py-6 text-center text-sm">
                Error: {error.message}
              </CommandEmpty>
            ) : isLoading ? (
              <CommandEmpty className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                <span className="mt-2 block">Searching...</span>
              </CommandEmpty>
            ) : filteredResults.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm">
                No results found. Try a different search term or adjust filters.
              </CommandEmpty>
            ) : (
              <CommandList id="symbol-search-results">
                <CommandGroup>
                  {filteredResults.map((symbol, index) => (
                    <CommandItem
                      key={symbol.symbol && symbol.region ? 
                        `${symbol.symbol}-${symbol.region}` : 
                        `result-${index}`}
                      onSelect={() => handleSelect(symbol)}
                      className="flex flex-col items-start"
                    >
                      <div className="flex w-full justify-between">
                        <span className="font-medium">{symbol.symbol || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {symbol.type || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex w-full justify-between">
                        <span className="text-sm text-muted-foreground truncate max-w-[70%]">
                          {symbol.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {symbol.region || 'Unknown'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </div>
      )}
    </div>
  )
} 