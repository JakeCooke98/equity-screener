import { useState, useCallback, useEffect } from 'react';
import { alphaVantageService, StockQuoteData } from '@/services/alphaVantage/index';
import { ApiError } from '@/services/api-client';
import { CacheManager } from '@/utils/cacheManager';
import { useAsync } from './useAsync';

// Use consistent caching with CacheManager
const quoteCache = new CacheManager<StockQuoteData>(5 * 60 * 1000); // 5 minutes TTL

interface UseStockQuoteResult {
  data: StockQuoteData | null;
  isLoading: boolean;
  error: Error | ApiError | null;
  fetchQuote: () => Promise<StockQuoteData | null | undefined>;
}

/**
 * Hook for lazy loading stock quote data with caching
 * 
 * Only fetches data when explicitly requested via fetchQuote() or when symbol changes
 * Subsequent calls use cached data if available
 * 
 * @param symbol The stock symbol to fetch data for
 * @returns Quote data, loading state, error, and fetch function
 */
export function useStockQuote(symbol: string): UseStockQuoteResult {
  // Define the fetch function
  const fetchQuoteData = useCallback(async (): Promise<StockQuoteData | null> => {
    // Skip empty symbols
    if (!symbol) {
      return null;
    }
    
    // Try to get data from cache first
    const cachedData = quoteCache.get(symbol);
    if (cachedData) {
      return cachedData;
    }
    
    // If no cache or data is stale, fetch fresh data
    const quoteData = await alphaVantageService.fetchQuoteData(symbol);
    
    // Update our cache
    quoteCache.set(symbol, quoteData);
    
    return quoteData;
  }, [symbol]);

  // Use our custom useAsync hook
  const {
    execute: fetchQuote,
    data,
    error,
    isLoading
  } = useAsync<StockQuoteData | null>(fetchQuoteData, {
    immediate: !!symbol, // Fetch immediately if symbol is provided
    initialData: quoteCache.get(symbol) || null, // Initialize with cached data if available
    onError: (error) => {
      console.error(`Error fetching quote for ${symbol}:`, error);
      
      // Try to use stale data if available
      const staleData = quoteCache.get(symbol, { useStaleOnError: true });
      if (staleData) {
        console.log(`Using stale cached data for ${symbol}`);
        return staleData;
      }
      return null;
    }
  });

  return { 
    data: data as StockQuoteData | null, 
    isLoading, 
    error, 
    fetchQuote
  };
} 