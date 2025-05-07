import { TimeSeriesDataPoint } from "@/services/alphaVantage/index";

// Mock data for popular symbols
export const mockTimeSeriesData: Record<string, TimeSeriesDataPoint[]> = {
  // Apple stock data (simplified and approximated)
  "AAPL": generateTimeSeriesForSymbol("AAPL", 170, 190),
  
  // Microsoft stock data
  "MSFT": generateTimeSeriesForSymbol("MSFT", 330, 350),
  
  // Google stock data
  "GOOGL": generateTimeSeriesForSymbol("GOOGL", 130, 145),
  
  // Amazon stock data
  "AMZN": generateTimeSeriesForSymbol("AMZN", 120, 140),
  
  // Tesla stock data
  "TSLA": generateTimeSeriesForSymbol("TSLA", 170, 240, 15),
};

/**
 * Generate realistic looking time series data for a stock
 */
function generateTimeSeriesForSymbol(
  symbol: string, 
  baseMin: number, 
  baseMax: number, 
  volatility = 5
): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const today = new Date();
  
  // Start with a price in the given range
  let lastClose = baseMin + Math.random() * (baseMax - baseMin);
  
  // Generate last 12 months of data
  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - 11 + i);
    
    // Generate realistic price movement
    const change = (Math.random() - 0.5) * volatility;
    const close = Math.max(baseMin * 0.8, Math.min(baseMax * 1.2, lastClose + change));
    
    // Generate related values with realistic relationships
    const open = lastClose;
    const high = Math.max(open, close) + Math.random() * (volatility / 2);
    const low = Math.min(open, close) - Math.random() * (volatility / 2);
    
    // Volume tends to be higher on bigger price moves
    const priceChange = Math.abs(close - lastClose);
    const volumeBase = 1000000 + (priceChange / volatility) * 1000000;
    const volume = Math.round(volumeBase + Math.random() * volumeBase);
    
    data.push({
      date: date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    lastClose = close;
  }
  
  return data;
} 