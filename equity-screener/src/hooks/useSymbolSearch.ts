import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { ApiError } from '@/services/api-client';
import { alphaVantageService, SymbolSearchMatch } from '@/services/alphaVantage/index';
import { CacheManager } from '@/utils/cacheManager';

interface UseSymbolSearchResult {
  results: SymbolSearchMatch[];
  isLoading: boolean;
  error: ApiError | null;
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
  const [results, setResults] = useState<SymbolSearchMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  // Debounce the search query to prevent excessive API calls
  // Skip debouncing if debounceMs is 0 (immediate execution)
  const debouncedQuery = debounceMs > 0 ? useDebounce(query, debounceMs) : query;

  useEffect(() => {
    // Reset error when query changes
    setError(null);
    
    // Don't search if query is empty and not specifically requesting initial data (with debounceMs=0)
    if (!debouncedQuery.trim() && debounceMs !== 0) {
      setResults([]);
      return;
    }

    // Check cache first
    const cachedResults = symbolSearchCache.get(debouncedQuery);
    if (cachedResults !== null) {
      setResults(cachedResults);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        const data = await alphaVantageService.searchSymbols(debouncedQuery);
        // Cache the results
        symbolSearchCache.set(debouncedQuery, data);
        setResults(data);
      } catch (err) {
        setError(err as ApiError);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, debounceMs]);

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