import { SymbolSearchMatch, NewsArticle, StockQuoteData, CompanyOverview, TimeSeriesData } from '../index';

// Mock symbol search matches
export const mockSymbolMatches: SymbolSearchMatch[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 0.9,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 0.85,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    type: 'Equity',
    region: 'United States',
    currency: 'USD',
    matchScore: 0.8,
  },
];

// Mock news articles
export const mockNewsArticles: NewsArticle[] = [
  {
    title: 'Apple Announces New iPhone',
    url: 'https://example.com/apple-news',
    summary: 'Apple has announced its new iPhone with impressive features.',
    source: 'Tech News Daily',
    publishedAt: new Date().toISOString(),
    image: 'https://example.com/apple-image.jpg',
  },
  {
    title: 'Microsoft Reports Strong Earnings',
    url: 'https://example.com/microsoft-news',
    summary: 'Microsoft reported earnings that exceeded analyst expectations.',
    source: 'Business Today',
    publishedAt: new Date().toISOString(),
    image: 'https://example.com/microsoft-image.jpg',
  },
];

// Mock stock quote data
export const mockStockQuote: StockQuoteData = {
  symbol: 'AAPL',
  price: 170.5,
  open: 168.2,
  high: 171.3,
  low: 167.8,
  volume: 85000000,
  latestTradingDay: new Date(),
  previousClose: 169.2,
  change: 1.3,
  changePercent: 0.77,
  high52Week: 183.5,
  low52Week: 142.0,
};

// Mock company overview
export const mockCompanyOverview: CompanyOverview = {
  Symbol: 'AAPL',
  Name: 'Apple Inc',
  Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  Exchange: 'NASDAQ',
  Currency: 'USD',
  Country: 'USA',
  Sector: 'Technology',
  Industry: 'Consumer Electronics',
  MarketCapitalization: '2500000000000',
  PERatio: '28.5',
  DividendYield: '0.5',
  EPS: '6.15',
  Beta: '1.2',
  FiftyTwoWeekHigh: '183.5',
  FiftyTwoWeekLow: '142.0',
};

// Mock time series data point
const mockTimeSeriesDataPoints: TimeSeriesDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  
  return {
    date: date.toISOString().split('T')[0],
    open: 165 + Math.random() * 10,
    high: 170 + Math.random() * 10,
    low: 160 + Math.random() * 10,
    close: 168 + Math.random() * 10,
    volume: 70000000 + Math.random() * 20000000,
  };
});

// Mock time series data
export const mockTimeSeriesData: TimeSeriesData = {
  symbol: 'AAPL',
  lastUpdated: new Date(),
  timeZone: 'US/Eastern',
  dataPoints: mockTimeSeriesDataPoints,
};

// Alpha Vantage service mock
export const alphaVantageService = {
  searchSymbols: jest.fn().mockResolvedValue(mockSymbolMatches),
  fetchTimeSeriesData: jest.fn().mockResolvedValue(mockTimeSeriesData),
  fetchQuoteData: jest.fn().mockResolvedValue(mockStockQuote),
  fetchCompanyOverview: jest.fn().mockResolvedValue(mockCompanyOverview),
  fetchCompanyNews: jest.fn().mockResolvedValue(mockNewsArticles),
  fetchMarketNews: jest.fn().mockResolvedValue(mockNewsArticles),
  fetchMultiSymbolNews: jest.fn().mockResolvedValue(mockNewsArticles),
  symbolExists: jest.fn().mockResolvedValue(true),
  clearCache: jest.fn(),
  setUseMockData: jest.fn(),
};

export type { SymbolSearchMatch, TimeSeriesData, TimeSeriesDataPoint, StockQuoteData, CompanyOverview, NewsArticle }; 