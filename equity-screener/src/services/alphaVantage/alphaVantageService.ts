import { AlphaVantageClient, AlphaVantageSymbolSearchResponse, AlphaVantageTimeSeriesResponse, AlphaVantageQuoteResponse } from './alphaVantageClient';
import { ApiError, CacheOptions } from '../api-client';

// Domain models - Clean interfaces for the application to use

export interface SymbolSearchMatch {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
  matchScore: number | string; // Accept both number and string for compatibility
  marketOpen?: string;
  marketClose?: string;
  timezone?: string;
}

export interface TimeSeriesDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TimeSeriesData {
  symbol: string;
  lastUpdated: Date;
  timeZone: string;
  dataPoints: TimeSeriesDataPoint[];
}

export interface StockQuoteData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: Date;
  previousClose: number;
  change: number;
  changePercent: number;
  high52Week?: number;  // Add optional 52-week high
  low52Week?: number;   // Add optional 52-week low
}

// Add these interfaces
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

export interface NewsArticle {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  image?: string;
}

// Mock data for development or when API limits are reached
const MOCK_SYMBOLS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 1.0,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 1.0,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 1.0,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 1.0,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 1.0,
  },
];

// Alpha Vantage Service class
export class AlphaVantageService {
  private client: AlphaVantageClient;
  private useMockData: boolean;

  constructor(apiKey?: string, useMockData = false) {
    this.client = new AlphaVantageClient(apiKey);
    this.useMockData = useMockData;
  }

  /**
   * Search for stock symbols by keywords
   * @param query Search keywords
   * @param cacheOptions Cache options
   * @returns Promise with search matches
   */
  async searchSymbols(
    query: string,
    cacheOptions?: CacheOptions
  ): Promise<SymbolSearchMatch[]> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockSymbols(query);
    }

    try {
      const response = await this.client.searchSymbols(query, cacheOptions);
      return this.transformSymbolSearchResponse(response);
    } catch (error) {
      // Fall back to mock data if API error (e.g., rate limit)
      if ((error as ApiError).code === 'API_LIMIT_REACHED') {
        console.warn('API limit reached, using mock data for symbol search');
        return this.getMockSymbols(query);
      }
      throw error;
    }
  }

  /**
   * Fetch time series data for a stock symbol
   * @param symbol Stock symbol
   * @param cacheOptions Cache options
   * @returns Promise with time series data
   */
  async fetchTimeSeriesData(
    symbol: string,
    cacheOptions?: CacheOptions
  ): Promise<TimeSeriesData> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockTimeSeriesData(symbol);
    }

    try {
      const response = await this.client.fetchTimeSeriesData(symbol, cacheOptions);
      return this.transformTimeSeriesResponse(response);
    } catch (error) {
      // Fall back to mock data if API error (e.g., rate limit)
      if ((error as ApiError).code === 'API_LIMIT_REACHED') {
        console.warn('API limit reached, using mock data for time series');
        return this.getMockTimeSeriesData(symbol);
      }
      throw error;
    }
  }

  /**
   * Fetch current quote data for a stock symbol
   * @param symbol Stock symbol
   * @param cacheOptions Cache options
   * @returns Promise with quote data
   */
  async fetchQuoteData(
    symbol: string,
    cacheOptions?: CacheOptions
  ): Promise<StockQuoteData> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockQuoteData(symbol);
    }

    try {
      const response = await this.client.fetchQuoteData(symbol, cacheOptions);
      return this.transformQuoteResponse(response);
    } catch (error) {
      // Fall back to mock data if API error (e.g., rate limit)
      if ((error as ApiError).code === 'API_LIMIT_REACHED') {
        console.warn('API limit reached, using mock data for quote');
        return this.getMockQuoteData(symbol);
      }
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.client.clearCache();
  }

  /**
   * Enable or disable mock data usage
   */
  setUseMockData(useMockData: boolean): void {
    this.useMockData = useMockData;
  }

  /**
   * Check if a symbol exists by searching for it
   */
  async symbolExists(symbol: string): Promise<boolean> {
    try {
      const results = await this.searchSymbols(symbol);
      return results.some(result => result.symbol === symbol);
    } catch (error) {
      console.error('Error checking if symbol exists:', error);
      return false;
    }
  }

  /**
   * Fetch company overview data
   * @param symbol Stock symbol
   * @param cacheOptions Cache options
   * @returns Promise with company overview
   */
  async fetchCompanyOverview(
    symbol: string,
    cacheOptions?: CacheOptions
  ): Promise<CompanyOverview> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockCompanyOverview(symbol);
    }

    try {
      // For now, return mock data since we haven't implemented the API client method
      // In a real implementation, this would call the Alpha Vantage API
      return this.getMockCompanyOverview(symbol);
    } catch (error) {
      console.error('Error fetching company overview:', error);
      return this.getMockCompanyOverview(symbol);
    }
  }

  /**
   * Fetch company news articles
   * @param symbol Stock symbol
   * @param cacheOptions Cache options
   * @returns Promise with news articles
   */
  async fetchCompanyNews(
    symbol: string,
    cacheOptions?: CacheOptions
  ): Promise<NewsArticle[]> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockCompanyNews(symbol);
    }

    try {
      // For now, return mock data since we haven't implemented the API client method
      // In a real implementation, this would call the Alpha Vantage API
      return this.getMockCompanyNews(symbol);
    } catch (error) {
      console.error('Error fetching company news:', error);
      return this.getMockCompanyNews(symbol);
    }
  }

  /**
   * Fetch general market news
   * @param cacheOptions Cache options
   * @returns Promise with news articles
   */
  async fetchMarketNews(
    cacheOptions?: CacheOptions
  ): Promise<NewsArticle[]> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockMarketNews();
    }

    try {
      // For now, return mock data since we haven't implemented the API client method
      // In a real implementation, this would call the Alpha Vantage API
      return this.getMockMarketNews();
    } catch (error) {
      console.error('Error fetching market news:', error);
      return this.getMockMarketNews();
    }
  }

  /**
   * Fetch news for multiple symbols
   * @param symbols Array of stock symbols
   * @param cacheOptions Cache options
   * @returns Promise with news articles
   */
  async fetchMultiSymbolNews(
    symbols: string[],
    cacheOptions?: CacheOptions
  ): Promise<NewsArticle[]> {
    // Return mock data if enabled
    if (this.useMockData) {
      return this.getMockMultiSymbolNews(symbols);
    }

    try {
      // For now, return mock data since we haven't implemented the API client method
      // In a real implementation, this would call the Alpha Vantage API
      return this.getMockMultiSymbolNews(symbols);
    } catch (error) {
      console.error('Error fetching news for symbols:', error);
      return this.getMockMultiSymbolNews(symbols);
    }
  }

  // Private transformation methods

  private transformSymbolSearchResponse(
    response: AlphaVantageSymbolSearchResponse
  ): SymbolSearchMatch[] {
    if (!response.bestMatches) {
      return [];
    }

    return response.bestMatches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
      matchScore: parseFloat(match['9. matchScore']),
    }));
  }

  private transformTimeSeriesResponse(
    response: AlphaVantageTimeSeriesResponse
  ): TimeSeriesData {
    const metaData = response['Meta Data'];
    const timeSeries = response['Monthly Time Series'];

    // Extract basic information
    const result: TimeSeriesData = {
      symbol: metaData['2. Symbol'],
      lastUpdated: new Date(metaData['3. Last Refreshed']),
      timeZone: metaData['4. Time Zone'],
      dataPoints: [],
    };

    // Transform time series data points
    result.dataPoints = Object.entries(timeSeries)
      .map(([dateStr, data]) => ({
        date: new Date(dateStr),
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'], 10),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending

    return result;
  }

  private transformQuoteResponse(
    response: AlphaVantageQuoteResponse
  ): StockQuoteData {
    const quote = response['Global Quote'];

    // The Alpha Vantage API doesn't provide 52-week high/low in the quote endpoint,
    // so we need to omit these fields in the transformation
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume'], 10),
      latestTradingDay: new Date(quote['07. latest trading day']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) / 100,
      // We'll populate these fields in the mock data method
    };
  }

  // Mock data methods

  private getMockSymbols(query: string): SymbolSearchMatch[] {
    // Filter mock symbols based on query
    const lowerQuery = query.toLowerCase();
    return MOCK_SYMBOLS.filter(
      symbol =>
        symbol.symbol.toLowerCase().includes(lowerQuery) ||
        symbol.name.toLowerCase().includes(lowerQuery)
    );
  }

  private getMockTimeSeriesData(symbol: string): TimeSeriesData {
    const now = new Date();
    const dataPoints: TimeSeriesDataPoint[] = [];

    // Generate 60 months of mock data
    for (let i = 0; i < 60; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      date.setDate(1); // First day of month

      // Base values that change slightly each month
      const basePrice = 100 + Math.sin(i / 10) * 50;
      const volatility = 10;

      dataPoints.push({
        date,
        open: basePrice - volatility / 2 + Math.random() * volatility,
        high: basePrice + volatility / 2 + Math.random() * volatility,
        low: basePrice - volatility - Math.random() * volatility,
        close: basePrice + Math.random() * volatility - volatility / 2,
        volume: Math.floor(1000000 + Math.random() * 9000000),
      });
    }

    return {
      symbol,
      lastUpdated: new Date(),
      timeZone: 'US/Eastern',
      dataPoints,
    };
  }

  private getMockQuoteData(symbol: string): StockQuoteData {
    const basePrice = 100 + (symbol.charCodeAt(0) % 10) * 10;
    const change = (Math.random() * 6) - 3; // Random change between -3 and +3
    const changePercent = change / basePrice;

    // Calculate 52-week high/low as percentages of the base price
    const high52Week = basePrice * 1.2; // 20% higher than current price
    const low52Week = basePrice * 0.8; // 20% lower than current price

    return {
      symbol,
      price: basePrice + change,
      open: basePrice - 1 + Math.random() * 2,
      high: basePrice + 2 + Math.random() * 3,
      low: basePrice - 2 - Math.random() * 3,
      volume: Math.floor(1000000 + Math.random() * 9000000),
      latestTradingDay: new Date(),
      previousClose: basePrice,
      change,
      changePercent,
      high52Week,
      low52Week
    };
  }

  private getMockCompanyOverview(symbol: string): CompanyOverview {
    return {
      Symbol: symbol,
      Name: `${symbol} Corporation`,
      Description: `${symbol} Corporation is a leading technology company specializing in innovative solutions for various industries.`,
      Exchange: 'NYSE',
      Currency: 'USD',
      Country: 'United States',
      Sector: 'Technology',
      Industry: 'Software',
      MarketCapitalization: '250000000000',
      PERatio: '25.4',
      DividendYield: '1.2',
      EPS: '3.45',
      Beta: '1.05',
      FiftyTwoWeekHigh: '185.75',
      FiftyTwoWeekLow: '125.30'
    };
  }

  private getMockCompanyNews(symbol: string): NewsArticle[] {
    const now = new Date();
    
    return [
      {
        title: `${symbol} Announces Record Quarterly Results`,
        url: 'https://example.com/news/1',
        summary: `${symbol} Corporation today announced record quarterly results, exceeding analyst expectations with revenue growth of 15% year-over-year.`,
        source: 'Financial Times',
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        image: '' // Empty string will use our placeholder
      },
      {
        title: `${symbol} Releases New Product Line`,
        url: 'https://example.com/news/2',
        summary: `${symbol} has unveiled its newest product line, featuring cutting-edge technology and innovative design.`,
        source: 'Bloomberg',
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: `Analysts Upgrade ${symbol} Stock`,
        url: 'https://example.com/news/3',
        summary: `Several analysts have upgraded ${symbol} stock following positive growth projections for the coming fiscal year.`,
        source: 'Wall Street Journal',
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        image: '' // Empty string will use our placeholder
      }
    ];
  }

  private getMockMarketNews(): NewsArticle[] {
    const now = new Date();
    
    return [
      {
        title: 'Market Reaches All-Time High on Economic Optimism',
        url: 'https://example.com/news/market-high',
        summary: 'Major market indices closed at record highs today as investors responded positively to new economic data suggesting continued growth.',
        source: 'Financial Times',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        image: '' // Empty string will use our placeholder
      },
      {
        title: 'Fed Signals Potential Rate Changes in Coming Months',
        url: 'https://example.com/news/fed-rates',
        summary: 'Federal Reserve officials indicated they may adjust interest rates in response to inflation data and employment figures.',
        source: 'Wall Street Journal',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Global Supply Chain Issues Begin to Ease',
        url: 'https://example.com/news/supply-chain',
        summary: 'After months of disruption, global supply chains are showing signs of recovery, potentially relieving inflationary pressures.',
        source: 'Bloomberg',
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        image: '' // Empty string will use our placeholder
      },
      {
        title: 'Tech Sector Leads Market Rally',
        url: 'https://example.com/news/tech-rally',
        summary: 'Technology stocks surged today, leading a broader market rally as investors rotated back into growth-oriented sectors.',
        source: 'CNBC',
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Retail Sales Exceed Analyst Expectations',
        url: 'https://example.com/news/retail-sales',
        summary: 'Consumer spending showed resilience last month as retail sales figures came in above consensus forecasts.',
        source: 'Reuters',
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        image: '' // Empty string will use our placeholder
      }
    ];
  }

  private getMockMultiSymbolNews(symbols: string[]): NewsArticle[] {
    const now = new Date();
    const articles: NewsArticle[] = [];
    
    // Generate 2-3 news articles for each symbol
    symbols.forEach(symbol => {
      const randomArticleCount = Math.floor(Math.random() * 2) + 2; // 2-3 articles
      
      for (let i = 0; i < randomArticleCount; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
        const randomHoursAgo = Math.floor(Math.random() * 24); // 0-23 hours ago
        
        const publishDate = new Date(
          now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000) - (randomHoursAgo * 60 * 60 * 1000)
        );
        
        const hasImage = Math.random() > 0.5;
        
        articles.push({
          title: this.getRandomArticleTitle(symbol, i),
          url: `https://example.com/news/${symbol.toLowerCase()}-${i}`,
          summary: this.getRandomArticleSummary(symbol, i),
          source: this.getRandomSource(),
          publishedAt: publishDate.toISOString(),
          image: hasImage ? '' : undefined // Empty string for image placeholder or undefined for no image
        });
      }
    });
    
    // Sort by publish date, newest first
    return articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  // Helpers for generating mock news data

  private getRandomArticleTitle(symbol: string, index: number): string {
    const titles = [
      `${symbol} Reports Strong Quarterly Earnings`,
      `${symbol} Announces New Product Launch`,
      `${symbol} Expands Into New Markets`,
      `${symbol} Stock Rises on Positive Analyst Coverage`,
      `${symbol} CEO Discusses Growth Strategy`,
      `${symbol} Completes Acquisition Deal`,
      `Investors Respond to ${symbol}'s Latest Announcement`,
      `${symbol} Updates Financial Guidance`
    ];
    
    return titles[index % titles.length];
  }

  private getRandomArticleSummary(symbol: string, index: number): string {
    const summaries = [
      `${symbol} reported quarterly results that exceeded analyst expectations, with revenue growth across all business segments.`,
      `The leadership team at ${symbol} unveiled plans for expansion, including new product lines and market entries.`,
      `Financial analysts have revised their outlook for ${symbol}, citing improved market conditions and strategic initiatives.`,
      `${symbol} announced a strategic partnership that is expected to drive growth in key business areas.`,
      `Regulatory approval has been granted for ${symbol}'s proposed acquisition, which is expected to close next quarter.`,
      `${symbol} addressed investor concerns during a conference call, outlining steps to improve operational efficiency.`,
      `The board of directors at ${symbol} approved a share repurchase program and dividend increase.`,
      `${symbol} is responding to competitive pressures with a new strategy focused on innovation and customer retention.`
    ];
    
    return summaries[index % summaries.length];
  }

  private getRandomSource(): string {
    const sources = [
      'Bloomberg',
      'Wall Street Journal',
      'Financial Times',
      'CNBC',
      'Reuters',
      'MarketWatch',
      "Investor's Business Daily",
      "Barron's"
    ];
    
    return sources[Math.floor(Math.random() * sources.length)];
  }
}

// Create a singleton instance with API key from environment
const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
// Use mock data when no API key is provided
const useMockData = !apiKey;

export const alphaVantageService = new AlphaVantageService(apiKey, useMockData); 