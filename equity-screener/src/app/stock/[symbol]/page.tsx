'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, BarChart2, Loader2, AlertCircle } from "lucide-react"
import { fetchCompanyOverview, fetchCompanyNews, fetchTimeSeriesData, CompanyOverview, NewsArticle, TimeSeriesData, SymbolSearchMatch } from "@/services/alphaVantage"
import { formatCurrency, formatLargeNumber, formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSymbols } from "@/contexts/SymbolsContext"
import { StockPriceChart } from "@/components/stock/StockPriceChart"

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
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 md:px-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Equity Screener</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="gap-1"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="gap-1"
        >
          <Link href="/dashboard">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
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
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  {overview?.Name || symbol}
                  <span className="text-xl text-muted-foreground font-normal">
                    ({symbol})
                  </span>
                </>
              )}
            </h3>
            {overview && (
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
                  <div className="flex justify-center items-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : errors.priceData ? (
                  <Alert variant="destructive" className="h-80 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.priceData}</AlertDescription>
                  </Alert>
                ) : timeSeriesData ? (
                  <div className="h-80">
                    <StockPriceChart 
                      data={getPriceChartData()}
                      symbol={symbol}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-80 text-muted-foreground">
                    No price data available
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
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-4/5"></div>
                  </div>
                ) : errors.overview ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.overview}</AlertDescription>
                  </Alert>
                ) : overview ? (
                  <div className="space-y-6">
                    <p className="leading-7">{overview.Description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Sector</h4>
                        <p>{overview.Sector}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
                        <p>{overview.Industry}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Market Cap</h4>
                        <p>{formatMarketCap(overview.MarketCapitalization)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">P/E Ratio</h4>
                        <p>{overview.PERatio !== "None" ? overview.PERatio : "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">EPS</h4>
                        <p>{overview.EPS !== "None" ? overview.EPS : "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Dividend Yield</h4>
                        <p>{overview.DividendYield !== "None" ? 
                          `${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%` : 
                          "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Beta</h4>
                        <p>{overview.Beta !== "None" ? overview.Beta : "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">52W High</h4>
                        <p>{formatCurrency(parseFloat(overview.FiftyTwoWeekHigh))}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">52W Low</h4>
                        <p>{formatCurrency(parseFloat(overview.FiftyTwoWeekLow))}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No company data available</p>
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
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/4 opacity-70"></div>
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : errors.news ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.news}</AlertDescription>
                </Alert>
              ) : news.length > 0 ? (
                <div className="space-y-6">
                  {news.map((article, i) => (
                    <div key={i} className="space-y-2">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-start gap-1"
                      >
                        {article.title}
                        <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                      </a>
                      <div className="text-sm text-muted-foreground">
                        {article.source} · {formatDate(new Date(article.publishedAt))}
                      </div>
                      <p className="text-sm">{article.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No news articles available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="py-6 px-6 md:px-10 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Equity Screener. Powered by Alpha Vantage API.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Tailwind CSS, and Shadcn UI
          </p>
        </div>
      </footer>
    </div>
  )
} 