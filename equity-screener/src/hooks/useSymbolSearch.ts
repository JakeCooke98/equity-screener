import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { ApiError } from '@/services/api-client';
import { alphaVantageService, SymbolSearchMatch } from '@/services/alphaVantage/index';
import { CacheManager } from '@/utils/cacheManager';
import { useAsync } from './useAsync';

interface UseSymbolSearchResult {
  results: SymbolSearchMatch[];
  isLoading: boolean;
  error: ApiError | Error | null;
}

// Create a singleton cache instance for symbol search results
const symbolSearchCache = new CacheManager<SymbolSearchMatch[]>(30 * 60 * 1000); // 30 minutes TTL

/**
 * A hook for searching symbols with the Alpha Vantage API.
 * Includes debouncing, loading state, and error handling.
 * 
 * @param query The search query
 * @param debounceMs The debounce delay in milliseconds (0 for immediate execution)
 * @returns An object containing results, loading state, and error
 */
export function useSymbolSearch(
  query: string,
  debounceMs: number = 500
): UseSymbolSearchResult {
  // Debounce the search query to prevent excessive API calls
  // Skip debouncing if debounceMs is 0 (immediate execution)
  const debouncedQuery = debounceMs > 0 ? useDebounce(query, debounceMs) : query;
  const [results, setResults] = useState<SymbolSearchMatch[]>([]);

  // Define search function
  const searchSymbols = useCallback(async () => {
    // Don't search if query is empty and not specifically requesting initial data
    if (!debouncedQuery.trim() && debounceMs !== 0) {
      return [];
    }

    // Try to get from cache first
    const cachedResults = symbolSearchCache.get(debouncedQuery);
    if (cachedResults !== null) {
      return cachedResults;
    }

    // Fetch from API
    const data = await alphaVantageService.searchSymbols(debouncedQuery);
    
    // Cache the results
    symbolSearchCache.set(debouncedQuery, data);
    
    return data;
  }, [debouncedQuery, debounceMs]);

  // Use our custom useAsync hook to manage state
  const {
    execute,
    isLoading,
    error,
    data,
  } = useAsync<SymbolSearchMatch[]>(
    searchSymbols,
    {
      immediate: true,
      deps: [debouncedQuery],
      initialData: []
    }
  );

  // Update results when data changes
  useEffect(() => {
    if (data) {
      setResults(data);
    }
  }, [data]);

  return { results, isLoading, error };
}

// Expose a static version of the search for use outside of React components
useSymbolSearch.search = async (query: string): Promise<SymbolSearchMatch[]> => {
  try {
    // Use the getOrFetch method to simplify caching logic
    return await symbolSearchCache.getOrFetch(
      query,
      async () => alphaVantageService.searchSymbols(query),
      { useStaleOnError: true }
    );
  } catch (error) {
    console.error('Static search error:', error);
    return [];
  }
}; 