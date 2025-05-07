import { useState, useCallback, useEffect } from 'react';
import { alphaVantageService, StockQuoteData } from '@/services/alphaVantage/index';
import { ApiError } from '@/services/api-client';
import { CacheManager } from '@/utils/cacheManager';

// Use consistent caching with CacheManager
const quoteCache = new CacheManager<StockQuoteData>(5 * 60 * 1000); // 5 minutes TTL

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
    quoteCache.get(symbol) || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // When the symbol changes, reset the data state
  useEffect(() => {
    // Clear the data state when the symbol changes
    const cachedData = quoteCache.get(symbol);
    
    setData(cachedData);
    
    // Only show loading state if we don't have valid cached data
    setIsLoading(!cachedData && !!symbol);
    
    setError(null);
    
    // Immediately fetch new data for the symbol if not in cache
    if (symbol && !cachedData) {
      fetchQuote();
    }
  }, [symbol]);

  /**
   * Fetches quote data for the symbol
   * Uses cached data if available and not expired
   */
  const fetchQuote = useCallback(async () => {
    // Skip empty symbols
    if (!symbol) {
      return;
    }
    
    // Try to get data from cache
    const cachedData = quoteCache.get(symbol);
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }
    
    // If no cache or data is stale, fetch fresh data
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the service to fetch data
      const quoteData = await alphaVantageService.fetchQuoteData(symbol);
      
      // Update our cache
      quoteCache.set(symbol, quoteData);
      
      setData(quoteData);
    } catch (err) {
      console.error(`Error fetching quote for ${symbol}:`, err);
      
      // Try to use stale data if available
      const staleData = quoteCache.get(symbol, { useStaleOnError: true });
      if (staleData) {
        console.log(`Using stale cached data for ${symbol}`);
        setData(staleData);
      } else {
        // Extract error message
        const errorMessage = (err as ApiError)?.message || 
          (err instanceof Error ? err.message : 'Failed to fetch quote data');
        
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  return { data, isLoading, error, fetchQuote };
} 