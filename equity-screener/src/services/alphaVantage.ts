/**
 * This file is deprecated and will be removed in a future version.
 * Import directly from '@/services/alphaVantage/index' instead.
 */

export * from '@/services/alphaVantage/index';

// Check if we're in development for warnings
const isDev = process.env.NODE_ENV === 'development';

// Provide access to the new functions directly
export const fetchMarketNews = (...args: any[]) => {
  const { alphaVantageService } = require('@/services/alphaVantage/index');
  return alphaVantageService.fetchMarketNews(...args);
};

export const fetchMultiSymbolNews = (symbols: string[], ...args: any[]) => {
  const { alphaVantageService } = require('@/services/alphaVantage/index');
  return alphaVantageService.fetchMultiSymbolNews(symbols, ...args);
};
