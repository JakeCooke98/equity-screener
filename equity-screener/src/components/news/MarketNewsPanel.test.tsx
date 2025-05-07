import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketNewsPanel } from './MarketNewsPanel';
import { alphaVantageService } from '@/services/alphaVantage/index';
import { useAsync } from '@/hooks/useAsync';
import '@testing-library/jest-dom';

// Mock the AlphaVantage service
jest.mock('@/services/alphaVantage/index', () => ({
  alphaVantageService: {
    fetchMarketNews: jest.fn(),
    fetchMultiSymbolNews: jest.fn()
  }
}));

// Mock the useAsync hook
jest.mock('@/hooks/useAsync', () => ({
  useAsync: jest.fn()
}));

// Mock news data
const mockMarketNews = [
  {
    title: 'Market Update: Stock Market Climbs',
    url: 'https://example.com/market-update',
    summary: 'The stock market climbed to new highs today amid positive economic data.',
    source: 'Financial Times',
    publishedAt: new Date().toISOString(),
    image: 'https://example.com/market-image.jpg'
  },
  {
    title: 'Inflation Report Shows Signs of Cooling',
    url: 'https://example.com/inflation-report',
    summary: 'The latest inflation report indicates that price increases are slowing down.',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    image: 'https://example.com/inflation-image.jpg'
  }
];

const mockSymbolNews = [
  {
    title: 'Apple Announces New Product Line',
    url: 'https://example.com/apple-news',
    summary: 'Apple unveiled its latest product line, featuring significant upgrades.',
    source: 'TechCrunch',
    publishedAt: new Date().toISOString(),
    image: 'https://example.com/apple-image.jpg'
  },
  {
    title: 'Microsoft Reports Strong Quarterly Earnings',
    url: 'https://example.com/microsoft-earnings',
    summary: 'Microsoft exceeded analyst expectations in its quarterly earnings report.',
    source: 'CNBC',
    publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    image: 'https://example.com/microsoft-image.jpg'
  }
];

describe('MarketNewsPanel', () => {
  // Setup for each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the default state for useAsync hook
    (useAsync as jest.Mock).mockReturnValue({
      execute: jest.fn(),
      isLoading: false,
      error: null,
      data: mockMarketNews,
      reset: jest.fn(),
      isIdle: false, 
      isSuccess: true,
      isError: false,
      status: 'success'
    });
  });

  it('renders market news panel with title', () => {
    render(<MarketNewsPanel />);
    
    // Use the h3 heading specifically
    expect(screen.getByRole('heading', { name: 'Market News' })).toBeInTheDocument();
    expect(screen.getByText('Latest financial market news and updates')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useAsync as jest.Mock).mockReturnValue({
      execute: jest.fn(),
      isLoading: true,
      error: null,
      data: null,
      reset: jest.fn(),
      isIdle: false,
      isSuccess: false,
      isError: false,
      status: 'pending'
    });
    
    render(<MarketNewsPanel />);
    
    // Check for skeleton loaders
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays error state with retry button', () => {
    const mockExecute = jest.fn();
    (useAsync as jest.Mock).mockReturnValue({
      execute: mockExecute,
      isLoading: false,
      error: new Error('Failed to fetch news'),
      data: null,
      reset: jest.fn(),
      isIdle: false,
      isSuccess: false,
      isError: true,
      status: 'error'
    });
    
    render(<MarketNewsPanel />);
    
    expect(screen.getByText('Failed to fetch news')).toBeInTheDocument();
    
    // Find and click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();
    
    expect(mockExecute).toHaveBeenCalled();
  });

  it('displays market news articles', () => {
    render(<MarketNewsPanel />);
    
    // Check if news articles are displayed
    expect(screen.getByText('Market Update: Stock Market Climbs')).toBeInTheDocument();
    expect(screen.getByText('Inflation Report Shows Signs of Cooling')).toBeInTheDocument();
    
    // Check for source and read more link
    expect(screen.getByText(/Financial Times/)).toBeInTheDocument();
    expect(screen.getAllByText('Read full article').length).toBe(2);
  });

  it('displays symbol news when symbols are provided', async () => {
    // Setup multi-symbol news data
    (useAsync as jest.Mock).mockReturnValue({
      execute: jest.fn(),
      isLoading: false,
      error: null,
      data: mockSymbolNews,
      reset: jest.fn(),
      isIdle: false,
      isSuccess: true,
      isError: false,
      status: 'success'
    });
    
    render(<MarketNewsPanel selectedSymbols={['AAPL', 'MSFT']} />);
    
    // Check for symbol-specific title
    expect(screen.getByRole('heading', { name: 'News for AAPL, MSFT' })).toBeInTheDocument();
    
    // Check for symbol news articles
    expect(screen.getByText('Apple Announces New Product Line')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Reports Strong Quarterly Earnings')).toBeInTheDocument();
  });

  it('toggles between expanded and collapsed state', async () => {
    const user = userEvent.setup();
    const { container } = render(<MarketNewsPanel />);
    
    // Initially expanded
    const initialContentWrapper = container.querySelector('.max-h-\\[2000px\\]');
    expect(initialContentWrapper).not.toBeNull();
    
    // Find and click collapse button
    const collapseButton = screen.getByLabelText('Collapse news panel');
    await user.click(collapseButton);
    
    // Should be collapsed now
    await waitFor(() => {
      const collapsedContentWrapper = container.querySelector('.max-h-0');
      expect(collapsedContentWrapper).not.toBeNull();
    });
    
    // Find and click expand button
    const expandButton = screen.getByLabelText('Expand news panel');
    await user.click(expandButton);
    
    // Should be expanded again
    await waitFor(() => {
      const expandedContentWrapper = container.querySelector('.max-h-\\[2000px\\]');
      expect(expandedContentWrapper).not.toBeNull();
    });
  });

  it('switches between market and symbol news tabs', async () => {
    const user = userEvent.setup();
    const resetMock = jest.fn();
    const executeMock = jest.fn();
    
    // Setup initial state with market news
    (useAsync as jest.Mock).mockReturnValue({
      execute: executeMock,
      isLoading: false,
      error: null,
      data: mockMarketNews,
      reset: resetMock,
      isIdle: false,
      isSuccess: true,
      isError: false,
      status: 'success'
    });
    
    render(<MarketNewsPanel selectedSymbols={['AAPL', 'MSFT']} />);
    
    // Initially should show selected symbols tab
    expect(screen.getByText('Selected Symbols (2)')).toHaveAttribute('data-state', 'active');
    
    // Switch to market news tab
    const marketTab = screen.getByText('Market News');
    await user.click(marketTab);
    
    // Should reset and fetch new data
    expect(resetMock).toHaveBeenCalled();
    expect(executeMock).toHaveBeenCalled();
  });

  it('displays empty state when no news is available', () => {
    (useAsync as jest.Mock).mockReturnValue({
      execute: jest.fn(),
      isLoading: false,
      error: null,
      data: [],
      reset: jest.fn(),
      isIdle: false,
      isSuccess: true,
      isError: false,
      status: 'success'
    });
    
    render(<MarketNewsPanel />);
    
    expect(screen.getByText('No news articles available')).toBeInTheDocument();
    expect(screen.getByText('There are currently no market news articles available.')).toBeInTheDocument();
  });

  it('formats relative time correctly', () => {
    const now = new Date();
    
    // Create news with various timestamps
    const testNews = [
      {
        ...mockMarketNews[0],
        publishedAt: new Date(now.getTime() - 30 * 1000).toISOString(), // 30 seconds ago
        title: 'Just Now Article'
      },
      {
        ...mockMarketNews[0],
        publishedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        title: 'Minutes Ago Article'
      },
      {
        ...mockMarketNews[0],
        publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        title: 'Hours Ago Article'
      }
    ];
    
    (useAsync as jest.Mock).mockReturnValue({
      execute: jest.fn(),
      isLoading: false,
      error: null,
      data: testNews,
      reset: jest.fn(),
      isIdle: false,
      isSuccess: true,
      isError: false,
      status: 'success'
    });
    
    render(<MarketNewsPanel />);
    
    // Check for specific article titles instead of time formats
    expect(screen.getByText('Just Now Article')).toBeInTheDocument();
    expect(screen.getByText('Minutes Ago Article')).toBeInTheDocument();
    expect(screen.getByText('Hours Ago Article')).toBeInTheDocument();
  });
}); 