import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { ApiError, searchSymbols, SymbolSearchMatch } from '@/services/alphaVantage';

interface UseSymbolSearchResult {
  results: SymbolSearchMatch[];
  isLoading: boolean;
  error: ApiError | null;
}

/**
 * A hook for searching symbols with the Alpha Vantage API.
 * Includes debouncing, loading state, and error handling.
 * 
 * @param query The search query
 * @param debounceMs The debounce delay in milliseconds
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
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    // Reset error when query changes
    setError(null);
    
    // Don't search if query is empty
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        const data = await searchSymbols(debouncedQuery);
        setResults(data);
      } catch (err) {
        setError(err as ApiError);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return { results, isLoading, error };
} 