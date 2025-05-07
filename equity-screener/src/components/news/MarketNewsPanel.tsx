'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { alphaVantageService, NewsArticle } from '@/services/alphaVantage/index'
import { cn } from '@/lib/utils'
import { CacheManager } from '@/utils/cacheManager'
import { ErrorMessage } from '@/components/ui/error-message'
import { EmptyState } from '@/components/ui/empty-state'
import { useAsync } from '@/hooks/useAsync'
import { SkeletonNews } from '@/components/ui/skeleton'

// Consistent caching with CacheManager
const marketNewsCache = new CacheManager<NewsArticle[]>(10 * 60 * 1000); // 10 minutes
const symbolNewsCache = new CacheManager<NewsArticle[]>(10 * 60 * 1000); // 10 minutes

/**
 * Formats a date string relative to current time (e.g., "2 hours ago")
 * 
 * @param dateString ISO date string to format
 * @returns Formatted relative time string
 */
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  } catch (e) {
    return 'Unknown date'
  }
}

interface MarketNewsPanelProps {
  /** Selected symbols to show news for (if any) */
  selectedSymbols?: string[]
  /** Class name to apply to the container */
  className?: string
}

/**
 * Market News Panel Component
 * 
 * Displays financial news either for selected symbols or general market news.
 * If no data is available from the API, shows a clean empty state.
 */
export function MarketNewsPanel({ selectedSymbols = [], className }: MarketNewsPanelProps) {
  // State
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'market'>(selectedSymbols.length > 0 ? 'all' : 'market')
  const [news, setNews] = useState<NewsArticle[]>([])
  
  // Use refs to track previous state for comparison
  const symbolKey = selectedSymbols.sort().join(',')
  const prevSymbolKey = useRef(symbolKey)
  const prevActiveTab = useRef(activeTab)
  const prevSelectedSymbolsLength = useRef(selectedSymbols.length)
  
  // Define the fetch function for market or symbol news
  const fetchNewsData = useCallback(async () => {
    if (activeTab === 'market' || selectedSymbols.length === 0) {
      // Check cache first for market news
      const cachedData = marketNewsCache.get('market-news');
      if (cachedData) {
        return cachedData;
      }
      
      // Fetch market news
      const data = await alphaVantageService.fetchMarketNews();
      
      // Cache the results
      if (data && data.length > 0) {
        marketNewsCache.set('market-news', data);
      }
      
      return data;
    } else {
      // Check cache first for symbol news
      const cachedData = symbolNewsCache.get(symbolKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Fetch symbol news
      const data = await alphaVantageService.fetchMultiSymbolNews(selectedSymbols);
      
      // Cache the results
      if (data && data.length > 0) {
        symbolNewsCache.set(symbolKey, data);
      }
      
      return data;
    }
  }, [activeTab, selectedSymbols, symbolKey]);
  
  // Use our custom hook to manage async state
  const {
    execute: fetchNews,
    isLoading,
    error,
    data: newsData,
    reset: resetNewsState
  } = useAsync<NewsArticle[]>(fetchNewsData);
  
  // Update the news state when new data is available
  useEffect(() => {
    if (newsData && newsData.length > 0) {
      setNews(newsData);
    } else if (newsData && newsData.length === 0) {
      // Clear news if empty array is returned (no results)
      setNews([]);
    }
  }, [newsData]);
  
  // Update active tab when symbols change
  useEffect(() => {
    const symbolsChanged = symbolKey !== prevSymbolKey.current;
    const symbolCountChanged = prevSelectedSymbolsLength.current !== selectedSymbols.length;
    
    // Track if symbols were added, removed, or just reordered
    const symbolsAdded = selectedSymbols.length > prevSelectedSymbolsLength.current;
    const symbolsRemoved = selectedSymbols.length < prevSelectedSymbolsLength.current;
    
    // Update refs
    prevSymbolKey.current = symbolKey;
    prevSelectedSymbolsLength.current = selectedSymbols.length;
    
    if (symbolsChanged) {
      console.log(`Symbols changed: ${prevSymbolKey.current} -> ${symbolKey}`);
      
      // If symbols were added and we're on market tab, switch to symbols tab
      if (symbolsAdded && activeTab === 'market') {
        console.log('Symbols added, switching to symbols tab');
        setActiveTab('all');
      }
      // If all symbols were removed and we're on symbols tab, switch to market tab
      else if (selectedSymbols.length === 0 && activeTab === 'all') {
        console.log('All symbols removed, switching to market tab');
        setActiveTab('market');
      } else {
        // For any other symbol changes, fetch new data and reset state
        resetNewsState();
        fetchNews();
      }
    }
  }, [selectedSymbols, symbolKey, activeTab, fetchNews, resetNewsState]);
  
  // Fetch news on initial load
  useEffect(() => {
    fetchNews();
  }, []);
  
  // Fetch news when tab changes
  useEffect(() => {
    const tabChanged = prevActiveTab.current !== activeTab;
    
    if (tabChanged) {
      console.log(`Tab changed from ${prevActiveTab.current} to ${activeTab}`);
      prevActiveTab.current = activeTab;
      
      // Reset state and fetch new data
      resetNewsState();
      fetchNews();
    }
  }, [activeTab, fetchNews, resetNewsState]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Only allow 'all' tab if we have selected symbols
    if (value === 'all' && selectedSymbols.length === 0) {
      console.log('Attempted to switch to symbols tab with no symbols selected');
      return;
    }
    
    setActiveTab(value as 'all' | 'market');
  };
  
  // Title text based on state
  const titleText = activeTab === 'market' 
    ? 'Market News' 
    : selectedSymbols.length > 0 
      ? `News for ${selectedSymbols.join(', ')}` 
      : 'Market News';
  
  return (
    <Card className={cn('w-full min-h-[12rem] overflow-hidden', className)}>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">{titleText}</CardTitle>
          <CardDescription>
            {activeTab === 'market' || selectedSymbols.length === 0 
              ? 'Latest financial market news and updates' 
              : `Latest news for ${selectedSymbols.length} selected symbol${selectedSymbols.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="min-w-[260px]">
            <TabsList className="w-full">
              {selectedSymbols.length > 0 ? (
                <>
                  <TabsTrigger value="all" className="flex-1 font-medium">
                    Selected Symbols ({selectedSymbols.length})
                  </TabsTrigger>
                  <TabsTrigger value="market" className="flex-1 font-medium">
                    Market News
                  </TabsTrigger>
                </>
              ) : (
                <TabsTrigger value="market" className="flex-1 font-medium">
                  Market News
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse news panel' : 'Expand news panel'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <CardContent className="px-6 pb-6">
          {isLoading ? (
            <SkeletonNews count={6} />
          ) : error ? (
            <ErrorMessage 
              error={error} 
              showRetry={true}
              onRetry={fetchNews}
            />
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
              {news.map((article, index) => (
                <Card 
                  key={`${article.title}-${index}`}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                  {article.image && (
                    <div className="h-40 overflow-hidden flex-shrink-0 relative bg-muted">
                      <img 
                        src={article.image} 
                        alt="" 
                        className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                        loading="lazy"
                        onLoad={(e) => {
                          // Store the target element in a variable to prevent it from being null
                          const img = e.currentTarget;
                          // Add a slight delay to prevent flickering
                          setTimeout(() => {
                            // Check if the element is still in the DOM
                            if (img.isConnected) {
                              img.classList.remove('opacity-0');
                              img.classList.add('opacity-100');
                            }
                          }, 50);
                        }}
                        onError={(e) => {
                          // Hide broken images
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-muted opacity-60">
                        {/* Loading spinner for the image */}
                      </div>
                    </div>
                  )}
                  <CardContent className={cn("p-4 flex-grow flex flex-col", !article.image && "pt-4")}>
                    <h3 className="text-base font-medium line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mb-2">
                      {article.source} • {formatRelativeTime(article.publishedAt)}
                    </div>
                    <p className="text-sm line-clamp-3 mb-3 flex-grow">
                      {article.summary}
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      asChild
                      className="p-0 h-auto mt-auto"
                    >
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary"
                      >
                        Read full article
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No news articles available"
              description={activeTab === 'market' 
                ? 'There are currently no market news articles available.' 
                : `No news found for ${selectedSymbols.join(', ')}.`}
              type="empty"
              heightClass="h-60"
            />
          )}
        </CardContent>
      </div>
    </Card>
  )
} 