'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart2, AlertCircle } from "lucide-react"
import { fetchCompanyOverview, fetchCompanyNews, fetchTimeSeriesData, CompanyOverview, NewsArticle, TimeSeriesData, SymbolSearchMatch } from "@/services/alphaVantage"
import { formatCurrency, formatLargeNumber, formatDate } from "@/lib/formatters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSymbols } from "@/contexts/SymbolsContext"
import { RootLayout } from "@/components/layout/root-layout"
import { FavoriteButton } from '@/components/favorites/FavoriteButton'

// Import types for properly typed dynamic imports
import type { StockPriceChartProps } from '@/components/stock/StockPriceChart'
import type { StockOverviewSectionProps } from '@/components/stock/StockOverviewSection'
import type { StockNewsSectionProps } from '@/components/stock/StockNewsSection'

// Lazy load components with Next.js dynamic imports
const StockPriceChart = dynamic<StockPriceChartProps>(
  () => import('@/components/stock/StockPriceChart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

const StockOverviewSection = dynamic<StockOverviewSectionProps>(
  () => import('@/components/stock/StockOverviewSection'),
  { 
    loading: () => <OverviewSkeleton />,
    ssr: false
  }
);

const StockNewsSection = dynamic<StockNewsSectionProps>(
  () => import('@/components/stock/StockNewsSection'),
  { 
    loading: () => <NewsSkeleton />,
    ssr: false
  }
);

// Skeleton loaders
function HeaderSkeleton() {
  return (
    <div className="animate-pulse flex items-center">
      <div className="h-8 bg-muted rounded w-40"></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="h-8 bg-muted rounded w-1/5"></div>
      </div>
      <div className="h-[300px] bg-muted rounded w-full"></div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-muted rounded w-1/3"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
        {[...Array(9)].map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/4 opacity-70"></div>
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

// Create a simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function StockDetailPage() {
  const router = useRouter()
  const { symbol } = useParams() as { symbol: string }
  const { toggleSymbol, isSymbolSelected, selectedSymbols } = useSymbols()
  
  // Force re-render when selectedSymbols changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [selectedSymbols]);
  
  // State for data
  const [overview, setOverview] = useState<CompanyOverview | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null)
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('1y')
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    overview: true,
    news: true,
    priceData: true
  })
  const [errors, setErrors] = useState({
    overview: null as string | null,
    news: null as string | null,
    priceData: null as string | null
  })
  
  // Create a symbol object for context operations
  const symbolObject = useMemo((): SymbolSearchMatch => ({
    symbol,
    name: overview?.Name || symbol,
    type: overview?.Sector || "Stock",
    region: overview?.Exchange || "US",
    marketOpen: "",
    marketClose: "",
    timezone: "",
    currency: overview?.Currency || "USD",
    matchScore: "1.0"
  }), [symbol, overview]);
  
  // Check if symbol is in dashboard directly from context
  const isInDashboard = useMemo(() => {
    // Simple check based only on symbol ticker, ignoring other properties
    return selectedSymbols.some(s => s.symbol === symbol);
  }, [selectedSymbols, symbol]);
  
  // Process stock data for charts based on timeframe
  const getPriceChartData = () => {
    if (!timeSeriesData) return []
    
    // Filter data based on selected timeframe
    const monthsToShow = timeframe === '1m' ? 1 : 
                          timeframe === '3m' ? 3 : 
                          timeframe === '6m' ? 6 : 12
    
    const filteredData = timeSeriesData.data.slice(0, monthsToShow)
    
    // Return in format expected by chart component
    return filteredData.map(point => ({
      date: point.date,
      price: point.close
    })).reverse() // Reverse to show oldest to newest
  }
  
  // Fetch company data
  useEffect(() => {
    if (!symbol) return
    
    // Reset states
    setIsLoading({
      overview: true,
      news: true,
      priceData: true
    })
    setErrors({
      overview: null,
      news: null,
      priceData: null
    })
    
    // Fetch company overview
    const fetchOverview = async () => {
      try {
        const data = await fetchCompanyOverview(symbol)
        setOverview(data)
      } catch (err) {
        console.error("Error fetching company overview:", err)
        setErrors(prev => ({ ...prev, overview: "Failed to load company data" }))
      } finally {
        setIsLoading(prev => ({ ...prev, overview: false }))
      }
    }
    
    // Fetch company news
    const fetchNews = async () => {
      try {
        const data = await fetchCompanyNews(symbol)
        setNews(data)
      } catch (err) {
        console.error("Error fetching news:", err)
        setErrors(prev => ({ ...prev, news: "Failed to load news articles" }))
      } finally {
        setIsLoading(prev => ({ ...prev, news: false }))
      }
    }
    
    // Fetch price history
    const fetchPriceHistory = async () => {
      try {
        const data = await fetchTimeSeriesData(symbol)
        setTimeSeriesData(data)
      } catch (err) {
        console.error("Error fetching price history:", err)
        setErrors(prev => ({ ...prev, priceData: "Failed to load price data" }))
      } finally {
        setIsLoading(prev => ({ ...prev, priceData: false }))
      }
    }
    
    // Execute all fetches in parallel
    fetchOverview()
    fetchNews()
    fetchPriceHistory()
  }, [symbol])
  
  // Format market cap
  const formatMarketCap = (marketCap: string) => {
    const value = parseInt(marketCap)
    return isNaN(value) ? "N/A" : formatLargeNumber(value)
  }
  
  // Handle adding/removing stock from dashboard
  const handleToggleInDashboard = useCallback(() => {
    // Use the toggle function from context
    toggleSymbol(symbolObject);
  }, [toggleSymbol, symbolObject]);

  return (
    <RootLayout>
      <div className="py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Page title and description */}
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Stock Details</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            View detailed information, price history, and news for this security.
          </p>
        </div>
        
        {/* Company Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-6 bg-muted/20 rounded-lg border">
          <div>
            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {isLoading.overview ? (
                <HeaderSkeleton />
              ) : (
                <>
                  {overview?.Name || symbol}
                  <span className="text-xl text-muted-foreground font-normal">
                    ({symbol})
                  </span>
                  <FavoriteButton symbol={symbolObject} size="default" />
                </>
              )}
            </h3>
            {!isLoading.overview && overview && (
              <p className="text-muted-foreground mt-1">
                {overview.Exchange} · {overview.Currency} · {overview.Country}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <Button
              variant={isInDashboard ? "destructive" : "default"}
              onClick={handleToggleInDashboard}
              className="font-medium min-w-[160px]"
            >
              {isInDashboard ? "Remove from Dashboard" : "Add to Dashboard"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Price Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pt-6 pb-3 px-6">
                <CardTitle>Price History</CardTitle>
                <CardDescription>
                  Historical closing prices for {overview?.Name || symbol}
                </CardDescription>
                <div className="flex justify-end">
                  <Tabs defaultValue={timeframe} onValueChange={(v) => setTimeframe(v as '1m' | '3m' | '6m' | '1y')}>
                    <TabsList>
                      <TabsTrigger value="1m">1M</TabsTrigger>
                      <TabsTrigger value="3m">3M</TabsTrigger>
                      <TabsTrigger value="6m">6M</TabsTrigger>
                      <TabsTrigger value="1y">1Y</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {isLoading.priceData ? (
                  <ChartSkeleton />
                ) : errors.priceData ? (
                  <Alert variant="destructive" className="h-80 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.priceData}</AlertDescription>
                  </Alert>
                ) : !timeSeriesData ? (
                  <div className="flex justify-center items-center h-80 text-muted-foreground">
                    No price data available
                  </div>
                ) : (
                  <div className="h-80">
                    <ErrorBoundary
                      fallback={
                        <Alert variant="destructive" className="h-80 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Failed to load price chart</AlertDescription>
                        </Alert>
                      }
                    >
                      <Suspense fallback={<ChartSkeleton />}>
                        <StockPriceChart 
                          data={getPriceChartData()}
                          symbol={symbol}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Company Description */}
            <Card className="overflow-hidden">
              <CardHeader className="px-6 pt-6">
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {isLoading.overview ? (
                  <OverviewSkeleton />
                ) : errors.overview ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.overview}</AlertDescription>
                  </Alert>
                ) : !overview ? (
                  <p className="text-muted-foreground">No company data available</p>
                ) : (
                  <ErrorBoundary
                    fallback={
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Failed to load company overview</AlertDescription>
                      </Alert>
                    }
                  >
                    <Suspense fallback={<OverviewSkeleton />}>
                      <StockOverviewSection 
                        overview={overview} 
                        formatMarketCap={formatMarketCap}
                        formatCurrency={formatCurrency}
                      />
                    </Suspense>
                  </ErrorBoundary>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - News */}
          <Card className="h-fit overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <CardTitle>Recent News</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {isLoading.news ? (
                <NewsSkeleton />
              ) : errors.news ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.news}</AlertDescription>
                </Alert>
              ) : !news.length ? (
                <p className="text-muted-foreground">No news articles available</p>
              ) : (
                <ErrorBoundary
                  fallback={
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Failed to load news articles</AlertDescription>
                    </Alert>
                  }
                >
                  <Suspense fallback={<NewsSkeleton />}>
                    <StockNewsSection news={news} formatDate={formatDate} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RootLayout>
  )
} 