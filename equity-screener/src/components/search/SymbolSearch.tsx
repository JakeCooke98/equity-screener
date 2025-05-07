'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchIcon, Loader2, FilterIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSymbolSearch } from '@/hooks/useSymbolSearch'
import { SymbolSearchMatch } from '@/services/alphaVantage'
import { ErrorMessage } from '@/components/ui/error-message'

interface FilterOptions {
  type?: string;
  region?: string;
}

interface SymbolSearchProps {
  onSelectSymbol?: (symbol: SymbolSearchMatch) => void;
  onSearchResults?: (results: SymbolSearchMatch[], isLoading: boolean) => void;
  placeholder?: string;
}

export function SymbolSearch({ 
  onSelectSymbol, 
  onSearchResults,
  placeholder = 'Search for stocks, ETFs, mutual funds...'
}: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [preloadedTypes, setPreloadedTypes] = useState<string[]>([])
  const [preloadedRegions, setPreloadedRegions] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [filteredResults, setFilteredResults] = useState<SymbolSearchMatch[]>([])
  
  // Ref for the input element
  const inputRef = useRef<HTMLInputElement>(null)

  // Use our custom hook for searching symbols
  const { results, isLoading, error } = useSymbolSearch(query, 400)

  // Preload some initial data for filters
  useEffect(() => {
    const preloadData = async () => {
      try {
        // Use the static method to preload data
        const popularResults = await useSymbolSearch.search('a')
        
        if (popularResults.length > 0) {
          // Extract unique types and regions from results
          const types = [...new Set(popularResults.map(result => result.type))].filter(Boolean)
          const regions = [...new Set(popularResults.map(result => result.region))].filter(Boolean)
          
          setPreloadedTypes(types)
          setPreloadedRegions(regions)
        }
      } catch (err) {
        console.error('Error preloading filter data:', err)
      } finally {
        setIsInitialized(true)
      }
    }
    
    preloadData()
  }, [])

  // Filter results any time the source data or filters change
  useEffect(() => {
    // Apply filters to the results
    const newFilteredResults = results
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
      // Sort by matchScore (convert to number to ensure proper comparison)
      .sort((a, b) => {
        const scoreA = typeof a.matchScore === 'number' ? a.matchScore : parseFloat(String(a.matchScore))
        const scoreB = typeof b.matchScore === 'number' ? b.matchScore : parseFloat(String(b.matchScore))
        return scoreB - scoreA
      })
    
    setFilteredResults(newFilteredResults)
  }, [results, filters])

  // Pass search results to parent component - separate from the filtering effect
  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(filteredResults, isLoading)
    }
  }, [filteredResults, isLoading, onSearchResults])

  // Get unique values for filters
  const uniqueTypes = [...new Set([...preloadedTypes, ...results.map(result => result.type)])].filter(Boolean)
  const uniqueRegions = [...new Set([...preloadedRegions, ...results.map(result => result.region)])].filter(Boolean)

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
    <div className="w-full space-y-4">
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
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search for symbols"
        />
        {query.length > 0 && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" 
            aria-hidden="true"
          />
        )}
      </div>

      {/* Filter options - always visible */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          {uniqueTypes.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={filters.type ? "default" : "outline"} size="sm" className="h-8">
                  <FilterIcon className="h-3.5 w-3.5 mr-2" />
                  Asset Type
                  {filters.type && (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 hover:bg-primary/20">
                      {filters.type}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search types..." />
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
                <Button variant={filters.region ? "default" : "outline"} size="sm" className="h-8">
                  <FilterIcon className="h-3.5 w-3.5 mr-2" />
                  Region
                  {filters.region && (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 hover:bg-primary/20">
                      {filters.region}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search regions..." />
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
        </div>

        {/* Clear filters button */}
        {(filters.type || filters.region) && (
          <Button variant="ghost" size="sm" className="h-8" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-2" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Status message for error states - only shown when needed */}
      {error && (
        <ErrorMessage 
          error={error}
          onDismiss={() => setQuery('')}
        />
      )}
    </div>
  )
} 