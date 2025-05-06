import { CompanyOverview } from "@/services/alphaVantage";

interface StockOverviewSectionProps {
  overview: CompanyOverview;
  formatMarketCap: (marketCap: string) => string;
  formatCurrency: (value: number) => string;
}

export default function StockOverviewSection({ 
  overview, 
  formatMarketCap, 
  formatCurrency 
}: StockOverviewSectionProps) {
  return (
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
  );
} 