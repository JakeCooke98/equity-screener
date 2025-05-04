import { useState, useCallback, useEffect } from 'react';
import { StockQuoteData, fetchStockQuote } from '@/services/alphaVantage';

// In-memory cache to store quote data and avoid duplicate API calls
const quoteCache: Record<string, StockQuoteData> = {};

interface UseStockQuoteResult {
  data: StockQuoteData | null;
  isLoading: boolean;
  error: string | null;
  fetchQuote: () => Promise<void>;
}

/**
 * Hook for lazy loading stock quote data with caching
 * 
 * Only fetches data when explicitly requested via fetchQuote()
 * Subsequent calls use cached data if available
 * 
 * @param symbol The stock symbol to fetch data for
 * @returns Quote data, loading state, error, and fetch function
 */
export function useStockQuote(symbol: string): UseStockQuoteResult {
  const [data, setData] = useState<StockQuoteData | null>(
    // Initialize with cached data if available
    quoteCache[symbol] || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // When the symbol changes, reset the data state
  useEffect(() => {
    // Clear the data state when the symbol changes
    setData(null);
    setIsLoading(true); 
    setError(null);
    
    // Immediately fetch new data for the symbol
    if (symbol) {
      fetchQuote();
    }
  }, [symbol]);

  /**
   * Fetches quote data for the symbol
   * Uses cached data if available and not expired
   */
  const fetchQuote = useCallback(async () => {
    // If we already have data in the cache, check if it's still fresh (< 5 minutes old)
    if (quoteCache[symbol]) {
      const cachedData = quoteCache[symbol];
      const lastUpdated = new Date(cachedData.lastUpdated).getTime();
      const now = new Date().getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      // If data is less than 5 minutes old, use the cached version
      if (now - lastUpdated < fiveMinutesInMs) {
        setData(cachedData);
        return;
      }
    }
    
    // If no cache or data is stale, fetch fresh data
    setIsLoading(true);
    setError(null);
    
    try {
      const quoteData = await fetchStockQuote(symbol);
      
      // Update cache and state
      quoteCache[symbol] = quoteData;
      setData(quoteData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  return { data, isLoading, error, fetchQuote };
} 