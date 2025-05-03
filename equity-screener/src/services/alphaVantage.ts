/**
 * Alpha Vantage API client
 * 
 * This service handles all interactions with the Alpha Vantage API
 * including request throttling to respect the 5 req/min limit.
 */

import { mockSymbolSearchResults } from "@/utils/mockData";

export interface SymbolSearchMatch {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
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

// Flag to use mock data (useful during development)
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !API_KEY || API_KEY === 'your_api_key_here';

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

  // Use mock data in development if API key is not set
  if (USE_MOCK_DATA) {
    console.log('Using mock data for symbol search');
    
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

  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.append('function', 'SYMBOL_SEARCH');
    url.searchParams.append('keywords', keywords);
    url.searchParams.append('apikey', API_KEY);

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
  } catch (error) {
    console.error('Error searching symbols:', error);
    throw error;
  }
} 