import { ApiClient, CacheOptions } from '../api-client';

// Alpha Vantage API base URL
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/';

// Alpha Vantage API response interfaces
export interface AlphaVantageSymbolSearchResponse {
  bestMatches: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
  'Monthly Time Series': Record<
    string,
    {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    }
  >;
}

export interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

// Alpha Vantage client implementation
export class AlphaVantageClient extends ApiClient {
  constructor(apiKey?: string) {
    super(ALPHA_VANTAGE_BASE_URL, apiKey);
  }

  /**
   * Search for symbols by keywords
   * @param query Search query
   * @param cacheOptions Caching options
   * @returns Promise with search results
   */
  async searchSymbols(
    query: string,
    cacheOptions: CacheOptions = { enabled: true, ttl: 24 * 60 * 60 * 1000 } // 24 hours cache by default for searches
  ): Promise<AlphaVantageSymbolSearchResponse> {
    if (!query || query.trim() === '') {
      throw this.createError('Search query cannot be empty');
    }

    return this.request<AlphaVantageSymbolSearchResponse>('query', {
      function: 'SYMBOL_SEARCH',
      keywords: query
    }, cacheOptions);
  }

  /**
   * Fetch time series data for a symbol
   * @param symbol Stock symbol
   * @param cacheOptions Caching options
   * @returns Promise with time series data
   */
  async fetchTimeSeriesData(
    symbol: string,
    cacheOptions: CacheOptions = { enabled: true, ttl: 12 * 60 * 60 * 1000 } // 12 hours cache by default
  ): Promise<AlphaVantageTimeSeriesResponse> {
    if (!symbol || symbol.trim() === '') {
      throw this.createError('Symbol cannot be empty');
    }

    return this.request<AlphaVantageTimeSeriesResponse>('query', {
      function: 'TIME_SERIES_MONTHLY',
      symbol,
      datatype: 'json'
    }, cacheOptions);
  }

  /**
   * Fetch quote data for a symbol
   * @param symbol Stock symbol
   * @param cacheOptions Caching options
   * @returns Promise with quote data
   */
  async fetchQuoteData(
    symbol: string,
    cacheOptions: CacheOptions = { enabled: true, ttl: 15 * 60 * 1000 } // 15 minutes cache by default for current quotes
  ): Promise<AlphaVantageQuoteResponse> {
    if (!symbol || symbol.trim() === '') {
      throw this.createError('Symbol cannot be empty');
    }

    return this.request<AlphaVantageQuoteResponse>('query', {
      function: 'GLOBAL_QUOTE',
      symbol,
      datatype: 'json'
    }, cacheOptions);
  }
} 