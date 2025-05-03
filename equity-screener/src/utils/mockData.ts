import { SymbolSearchMatch } from '@/services/alphaVantage';

/**
 * Mock data for the symbol search API
 * This can be used during development to avoid hitting API rate limits
 */
export const mockSymbolSearchResults: SymbolSearchMatch[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.9167'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.8123'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7964'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7821'
  },
  {
    symbol: 'FB',
    name: 'Meta Platforms Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7635'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7412'
  },
  {
    symbol: 'BRK.A',
    name: 'Berkshire Hathaway Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7257'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.7103'
  },
  {
    symbol: 'V',
    name: 'Visa Inc',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.6982'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'Equity',
    region: 'United States',
    country: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: '0.6847'
  }
]; 