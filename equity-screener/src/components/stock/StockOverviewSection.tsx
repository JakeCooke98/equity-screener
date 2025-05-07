import { CompanyOverview } from '@/services/alphaVantage/index'

interface StockOverviewSectionProps {
  overview: CompanyOverview
  formatMarketCap: (marketCap: string) => string
  formatCurrency: (value: number) => string
}

// Make this interface available for import
export type { StockOverviewSectionProps };

export function StockOverviewSection({ 
  overview, 
  formatMarketCap, 
  formatCurrency 
}: StockOverviewSectionProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div>
        <p className="text-sm leading-6 mb-3">{overview.Description}</p>
      </div>
      
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <p className="font-medium">{formatMarketCap(overview.MarketCapitalization)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">P/E Ratio</p>
          <p className="font-medium">{parseFloat(overview.PERatio) > 0 ? parseFloat(overview.PERatio).toFixed(2) : 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Dividend Yield</p>
          <p className="font-medium">{parseFloat(overview.DividendYield) > 0 ? `${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%` : 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">EPS</p>
          <p className="font-medium">{parseFloat(overview.EPS) !== 0 ? formatCurrency(parseFloat(overview.EPS)) : 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Beta</p>
          <p className="font-medium">{parseFloat(overview.Beta) > 0 ? parseFloat(overview.Beta).toFixed(2) : 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">52-Week High</p>
          <p className="font-medium">{formatCurrency(parseFloat(overview.FiftyTwoWeekHigh))}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">52-Week Low</p>
          <p className="font-medium">{formatCurrency(parseFloat(overview.FiftyTwoWeekLow))}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Industry</p>
          <p className="font-medium">{overview.Industry || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
} 