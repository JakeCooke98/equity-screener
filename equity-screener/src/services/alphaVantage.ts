/**
 * Alpha Vantage API client
 * 
 * This service handles all interactions with the Alpha Vantage API
 * including request throttling to respect the 5 req/min limit.
 */

import { mockSymbolSearchResults } from "@/utils/mockData";
import { generateMockQuoteData } from "@/utils/mockQuoteData";
import { generateMockCompanyNews, generateMockCompanyOverview, generateMockMarketNews } from "@/utils/mockStockData";
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

export interface StockQuoteData {
  symbol: string;
  price: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  lastUpdated: string;
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

/**
 * Fetches the latest quote data for a given symbol
 * Includes last price, day change %, and 52-week high/low
 * 
 * @param symbol The stock symbol to fetch data for
 * @returns A promise that resolves to the quote data
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuoteData> {
  try {
    // Generate mock data in development to avoid hitting API rate limits
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for ${symbol} quote (enforced by environment variable or missing API key)`);
      
      // Generate realistic mock data based on the symbol
      const mockQuote = generateMockQuoteData(symbol);
      
      // Simulate API delay (shorter than time series to feel more responsive)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockQuote;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'GLOBAL_QUOTE');
      url.searchParams.append('symbol', symbol);
      url.searchParams.append('apikey', API_KEY);

      console.log(`Fetching quote data for ${symbol} from Alpha Vantage API`);
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

      // Check if we have quote data
      const quote = data['Global Quote'];
      if (!quote) {
        throw {
          message: 'No quote data found'
        };
      }

      // For the 52-week high/low, we'll need to make a second call to get the time series data
      // This is because GLOBAL_QUOTE doesn't provide this info
      const timeSeriesData = await fetchTimeSeriesData(symbol);
      
      // Find the 52-week high and low from the time series data
      const high52Week = Math.max(...timeSeriesData.data.map(d => d.high));
      const low52Week = Math.min(...timeSeriesData.data.map(d => d.low));

      return {
        symbol,
        price: parseFloat(quote['05. price']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        high52Week,
        low52Week,
        lastUpdated: new Date().toISOString(),
      };
    }

    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error(`Error fetching quote data for ${symbol}:`, error);
    
    // If API fails but we have mock data enabled as fallback, use it
    if (USE_MOCK_DATA) {
      console.log(`Falling back to mock data for ${symbol} quote after API failure`);
      return generateMockQuoteData(symbol);
    }
    
    throw error;
  }
}

// Interface for company overview data
export interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  Beta: string;
  FiftyTwoWeekHigh: string;
  FiftyTwoWeekLow: string;
}

// Interface for news article
export interface NewsArticle {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  image?: string;
}

/**
 * Fetches company overview data for a given symbol
 * 
 * @param symbol The stock symbol to fetch company overview for
 * @returns A promise that resolves to the company overview data
 */
export async function fetchCompanyOverview(symbol: string): Promise<CompanyOverview> {
  try {
    // Generate mock data in development to avoid hitting API rate limits
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for ${symbol} company overview (enforced by environment variable or missing API key)`);
      
      // Generate mock company overview data
      const mockOverview = generateMockCompanyOverview(symbol);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockOverview;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'OVERVIEW');
      url.searchParams.append('symbol', symbol);
      url.searchParams.append('apikey', API_KEY);

      console.log(`Fetching company overview for ${symbol} from Alpha Vantage API`);
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

      // Check if we got empty data
      if (!data.Symbol) {
        throw {
          message: 'No company overview found'
        };
      }

      return data as CompanyOverview;
    }

    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    // In case of any error, return mock data as fallback
    return generateMockCompanyOverview(symbol);
  }
}

/**
 * Fetches news articles related to a given symbol
 * 
 * @param symbol The stock symbol to fetch news for
 * @returns A promise that resolves to an array of news articles
 */
export async function fetchCompanyNews(symbol: string): Promise<NewsArticle[]> {
  try {
    // Generate mock data in development to avoid hitting API rate limits
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for ${symbol} news (enforced by environment variable or missing API key)`);
      
      // Generate mock news data
      const mockNews = generateMockCompanyNews(symbol);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return mockNews;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'NEWS_SENTIMENT');
      url.searchParams.append('tickers', symbol);
      url.searchParams.append('apikey', API_KEY);
      url.searchParams.append('limit', '10'); // Limit to 10 news articles

      console.log(`Fetching news for ${symbol} from Alpha Vantage API`);
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

      // Check if we got feed entries
      if (!data.feed || !Array.isArray(data.feed)) {
        throw {
          message: 'No news data found'
        };
      }

      // Transform the API response to our internal format
      return data.feed.map((item: any) => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
        source: item.source,
        publishedAt: item.time_published,
        image: item.banner_image || undefined
      }));
    }

    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error('Error fetching company news:', error);
    // In case of any error, return mock data as fallback
    return generateMockCompanyNews(symbol);
  }
}

/**
 * Fetches general market news (not specific to any symbol)
 * 
 * @returns A promise that resolves to an array of general market news articles
 */
export async function fetchMarketNews(): Promise<NewsArticle[]> {
  try {
    // Generate mock data in development to avoid hitting API rate limits
    if (USE_MOCK_DATA) {
      console.log('Using mock data for market news (enforced by environment variable or missing API key)');
      
      // Generate mock market news data
      const mockNews = generateMockMarketNews();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return mockNews;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'NEWS_SENTIMENT');
      url.searchParams.append('topics', 'financial_markets,economy_fiscal,economy_monetary');
      url.searchParams.append('apikey', API_KEY);
      url.searchParams.append('limit', '15'); // Limit to 15 news articles
      
      console.log('Fetching general market news from Alpha Vantage API');
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
      
      // Check if we got feed entries
      if (!data.feed || !Array.isArray(data.feed)) {
        throw {
          message: 'No news data found'
        };
      }
      
      // Transform the API response to our internal format
      return data.feed.map((item: any) => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
        source: item.source,
        publishedAt: item.time_published,
        image: item.banner_image || undefined
      }));
    }
    
    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error('Error fetching market news:', error);
    // In case of any error, return mock data as fallback
    return generateMockMarketNews();
  }
}

/**
 * Fetches news for multiple symbols combined
 * 
 * @param symbols Array of stock symbols to fetch news for
 * @returns A promise that resolves to an array of news articles related to the provided symbols
 */
export async function fetchMultiSymbolNews(symbols: string[]): Promise<NewsArticle[]> {
  if (!symbols.length) {
    return fetchMarketNews();
  }
  
  try {
    // Generate mock data in development to avoid hitting API rate limits
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for symbols [${symbols.join(', ')}] news (enforced by environment variable or missing API key)`);
      
      // Generate mock news data for each symbol and combine
      let combinedNews: NewsArticle[] = [];
      
      for (const symbol of symbols) {
        const mockNews = generateMockCompanyNews(symbol);
        combinedNews = [...combinedNews, ...mockNews];
      }
      
      // Limit to most recent 15 articles
      combinedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      combinedNews = combinedNews.slice(0, 15);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return combinedNews;
    }
    
    // Try to use the API when we have a key and mock data is not forced
    if (API_KEY && API_KEY !== 'your_api_key_here') {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('function', 'NEWS_SENTIMENT');
      url.searchParams.append('tickers', symbols.join(','));
      url.searchParams.append('apikey', API_KEY);
      url.searchParams.append('limit', '15'); // Limit to 15 news articles
      
      console.log(`Fetching news for symbols [${symbols.join(', ')}] from Alpha Vantage API`);
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
      
      // Check if we got feed entries
      if (!data.feed || !Array.isArray(data.feed)) {
        throw {
          message: 'No news data found'
        };
      }
      
      // Transform the API response to our internal format
      return data.feed.map((item: any) => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
        source: item.source,
        publishedAt: item.time_published,
        image: item.banner_image || undefined
      }));
    }
    
    // If we get here, we have no API key and mock data is disabled
    throw {
      message: 'API key is required for this operation'
    };
  } catch (error) {
    console.error('Error fetching multi-symbol news:', error);
    
    // In case of any error, return combined mock data as fallback
    let combinedNews: NewsArticle[] = [];
      
    for (const symbol of symbols) {
      const mockNews = generateMockCompanyNews(symbol);
      combinedNews = [...combinedNews, ...mockNews];
    }
    
    // Limit to most recent 15 articles
    combinedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return combinedNews.slice(0, 15);
  }
}