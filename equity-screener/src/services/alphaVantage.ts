/**
 * Alpha Vantage API client
 * 
 * This service handles all interactions with the Alpha Vantage API
 * including request throttling to respect the 5 req/min limit.
 */

import { mockSymbolSearchResults } from "@/utils/mockData";
import { mockTimeSeriesData } from "@/utils/mockTimeSeriesData";

export interface SymbolSearchMatch {
  symbol: string;
  name: string;
  type: string;
  region: string;
  country?: string; // Optional country field
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TimeSeriesData {
  symbol: string;
  data: TimeSeriesDataPoint[];
}

interface SymbolSearchResponse {
  bestMatches: Array<{
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "5. marketOpen": string;
    "6. marketClose": string;
    "7. timezone": string;
    "8. currency": string;
    "9. matchScore": string;
  }>;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Default base URL for Alpha Vantage API
const API_BASE_URL = 'https://www.alphavantage.co/query';

// Need to get an API key from Alpha Vantage
// For development, we'll use environment variables
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '';

// Flag to use mock data when:
// 1. NEXT_PUBLIC_USE_MOCK_DATA is explicitly set to 'true' (highest priority)
// 2. No API key is provided
// 3. A placeholder API key is used
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !API_KEY || API_KEY === 'your_api_key_here';

/**
 * Searches for symbols matching the given keywords
 * 
 * @param keywords The search query
 * @returns A promise that resolves to an array of symbol matches
 */
export async function searchSymbols(keywords: string): Promise<SymbolSearchMatch[]> {
  if (!keywords.trim()) {
    return [];
  }

  try {
    // Check if we should use mock data first (prioritize the environment variable setting)
    if (USE_MOCK_DATA) {
      console.log('Using mock data for symbol search (enforced by environment variable or missing API key)');
      
      // Filter mock data based on the keywords (case insensitive)
      const lowercaseKeywords = keywords.toLowerCase();
      const filteredResults = mockSymbolSearchResults.filter(
        (match: SymbolSearchMatch) => 
          match.symbol.toLowerCase().includes(lowercaseKeywords) || 
          match.name.toLowerCase().includes(lowercaseKeywords)
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return filteredResults;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'SYMBOL_SEARCH');
      url.searchParams.append('keywords', keywords);
      url.searchParams.append('apikey', API_KEY);

      console.log(`Searching for symbols with query "${keywords}" using Alpha Vantage API`);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw {
          message: `API request failed with status ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json() as SymbolSearchResponse;

      // Check for API error response
      if ('Error Message' in data) {
        throw {
          message: data['Error Message'] as string
        };
      }

      // If bestMatches is undefined, return empty array
      if (!data.bestMatches) {
        return [];
      }

      // Transform the API response to our internal format
      return data.bestMatches.map(match => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        marketOpen: match["5. marketOpen"],
        marketClose: match["6. marketClose"],
        timezone: match["7. timezone"],
        currency: match["8. currency"],
        matchScore: match["9. matchScore"],
      }));
    }

    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error('Error searching symbols:', error);
    
    // If API fails but we have mock data enabled as fallback, use it
    if (USE_MOCK_DATA) {
      console.log('Falling back to mock data after API failure');
      const lowercaseKeywords = keywords.toLowerCase();
      const filteredResults = mockSymbolSearchResults.filter(
        (match: SymbolSearchMatch) => 
          match.symbol.toLowerCase().includes(lowercaseKeywords) || 
          match.name.toLowerCase().includes(lowercaseKeywords)
      );
      return filteredResults;
    }
    
    throw error;
  }
}

/**
 * Fetches time series data for the given symbol
 * 
 * @param symbol The stock symbol to fetch data for
 * @returns A promise that resolves to time series data
 */
export async function fetchTimeSeriesData(symbol: string): Promise<TimeSeriesData> {
  try {
    // Check if we should use mock data first (prioritize the environment variable setting)
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for ${symbol} time series (enforced by environment variable or missing API key)`);
      
      // Find mock data for this symbol or generate some if not found
      const mockData = mockTimeSeriesData[symbol] || generateMockTimeSeriesData(symbol);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        symbol,
        data: mockData,
      };
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      // Use Monthly time series as specified
      url.searchParams.append('function', 'TIME_SERIES_MONTHLY');
      url.searchParams.append('symbol', symbol);
      url.searchParams.append('apikey', API_KEY);

      console.log(`Fetching time series data for ${symbol} from Alpha Vantage API`);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw {
          message: `API request failed with status ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json();

      // Check for API error response
      if ('Error Message' in data) {
        throw {
          message: data['Error Message'] as string
        };
      }

      // Parse the time series data
      const timeSeriesData: TimeSeriesDataPoint[] = [];
      const monthlyTimeSeries = data['Monthly Time Series'];
      
      if (!monthlyTimeSeries) {
        throw {
          message: 'No time series data found'
        };
      }
      
      // Get the last 12 months of data
      const dates = Object.keys(monthlyTimeSeries).sort().reverse().slice(0, 12);
      
      for (const date of dates) {
        const entry = monthlyTimeSeries[date];
        timeSeriesData.push({
          date,
          open: parseFloat(entry['1. open']),
          high: parseFloat(entry['2. high']),
          low: parseFloat(entry['3. low']),
          close: parseFloat(entry['4. close']),
          volume: parseInt(entry['5. volume']),
        });
      }

      return {
        symbol,
        data: timeSeriesData,
      };
    }

    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error(`Error fetching time series data for ${symbol}:`, error);
    
    // If API fails but we have mock data enabled as fallback, use it
    if (USE_MOCK_DATA) {
      console.log(`Falling back to mock data for ${symbol} after API failure`);
      const mockData = mockTimeSeriesData[symbol] || generateMockTimeSeriesData(symbol);
      return {
        symbol,
        data: mockData,
      };
    }
    
    throw error;
  }
}

/**
 * Generate mock time series data for a symbol
 * Used when no mock data is available and API is disabled
 */
function generateMockTimeSeriesData(symbol: string): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const today = new Date();
  
  // Generate last 12 months of data
  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    
    // Generate some base values using the symbol's characters
    const baseValue = (symbol.charCodeAt(0) * 2) % 100 + 50;
    const variance = (i * 3) % 20;
    
    // Add some random variance based on the month
    const close = baseValue + variance + (Math.random() * 10);
    const open = close - (Math.random() * 5);
    const high = close + (Math.random() * 3);
    const low = open - (Math.random() * 3);
    const volume = Math.round(100000 + Math.random() * 1000000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });
  }
  
  return data;
} 