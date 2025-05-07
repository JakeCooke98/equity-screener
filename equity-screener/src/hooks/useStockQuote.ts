import { useState, useCallback, useEffect } from 'react';
import { alphaVantageService, StockQuoteData } from '@/services/alphaVantage/index';
import { ApiError } from '@/services/api-client';

// In-memory cache to store quote data and avoid duplicate API calls
const quoteCache: Record<string, { data: StockQuoteData; timestamp: number }> = {};

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

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
    // Initialize with cached data if available and not expired
    quoteCache[symbol] && 
    (Date.now() - quoteCache[symbol].timestamp < CACHE_TTL) ? 
    quoteCache[symbol].data : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // When the symbol changes, reset the data state
  useEffect(() => {
    // Clear the data state when the symbol changes
    const cachedEntry = quoteCache[symbol];
    const isCacheValid = cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL);
    
    setData(isCacheValid ? cachedEntry.data : null);
    
    // Only show loading state if we don't have valid cached data
    setIsLoading(!isCacheValid);
    
    setError(null);
    
    // Immediately fetch new data for the symbol if not in cache or cache is expired
    if (symbol && !isCacheValid) {
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
    
    // If we already have data in the cache, check if it's still fresh
    const cachedEntry = quoteCache[symbol];
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
      setData(cachedEntry.data);
      setIsLoading(false);
      return;
    }
    
    // If no cache or data is stale, fetch fresh data
    setIsLoading(true);
    setError(null);
    
    try {
      const quoteData = await alphaVantageService.fetchQuoteData(symbol, { 
        enabled: true, 
        ttl: CACHE_TTL 
      });
      
      // Update our local cache and state
      quoteCache[symbol] = {
        data: quoteData,
        timestamp: Date.now()
      };
      
      setData(quoteData);
    } catch (err) {
      console.error(`Error fetching quote for ${symbol}:`, err);
      
      // If we have cached data, continue using it even if it's stale
      if (cachedEntry) {
        console.log(`Using stale cached data for ${symbol}`);
        setData(cachedEntry.data);
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