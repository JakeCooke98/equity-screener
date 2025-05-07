// Import all needed types and the service
import { 
  AlphaVantageService, 
  type SymbolSearchMatch,
  type TimeSeriesData,
  type TimeSeriesDataPoint,
  type StockQuoteData,
  type CompanyOverview,
  type NewsArticle
} from './alphaVantageService';

// Import client
import { AlphaVantageClient } from './alphaVantageClient';

// Get values from environment
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Create service instance with appropriate settings
const alphaVantageService = new AlphaVantageService(API_KEY, USE_MOCK_DATA);

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log(`Alpha Vantage Service Configuration:
  - API Key: ${API_KEY ? '✓ Set' : '✗ Not set'}
  - Mock Data: ${USE_MOCK_DATA ? '✓ Enabled' : '✗ Disabled'}
  `);
}

// Re-export everything
export { alphaVantageService, AlphaVantageService, AlphaVantageClient };

// Re-export types
export type {
  SymbolSearchMatch,
  TimeSeriesData,
  TimeSeriesDataPoint,
  StockQuoteData,
  CompanyOverview,
  NewsArticle
}; 