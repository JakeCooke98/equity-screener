import { StockQuoteData } from "@/services/alphaVantage/index";

/**
 * Generate mock quote data for a symbol
 * Used when no mock data is available and API is disabled
 */
function generateMockQuoteData(symbol: string): StockQuoteData {
    // Use the symbol's character codes to generate consistent prices for the same symbol
    const basePrice = 
      (symbol.charCodeAt(0) * 2 + 
      (symbol.charCodeAt(1) || 0) * 1.5) % 200 + 50;
    
    // Calculate a change percent between -5% and +5%
    const changePercent = ((symbol.charCodeAt(0) % 10) - 5) + ((Math.random() * 2) - 1);
    
    // Generate 52-week high and low based on the base price
    const high52Week = basePrice * (1 + (Math.random() * 0.2) + 0.1); // 10-30% higher
    const low52Week = basePrice * (1 - (Math.random() * 0.2) - 0.05); // 5-25% lower
  
    return {
      symbol,
      price: parseFloat(basePrice.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high52Week: parseFloat(high52Week.toFixed(2)),
      low52Week: parseFloat(low52Week.toFixed(2)),
      latestTradingDay: new Date(),
      open: parseFloat((basePrice * 0.98).toFixed(2)),
      high: parseFloat((basePrice * 1.03).toFixed(2)),
      low: parseFloat((basePrice * 0.97).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      previousClose: parseFloat((basePrice * 0.99).toFixed(2)),
      change: parseFloat((basePrice * changePercent / 100).toFixed(2))
    };
  } 

  export { generateMockQuoteData };