import { CompanyOverview, NewsArticle } from "@/services/alphaVantage/index";
import { generateMockQuoteData } from "./mockQuoteData";

/**
 * Generate mock company overview data
 */
function generateMockCompanyOverview(symbol: string): CompanyOverview {
    // Use symbol to generate consistent mock data
    const symbolValue = symbol.toLowerCase().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Company names based on symbol (for consistency)
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'TSLA': 'Tesla, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'V': 'Visa Inc.',
      'JNJ': 'Johnson & Johnson',
      'WMT': 'Walmart Inc.'
    };
    
    // Descriptions based on symbol (for consistency)
    const descriptions: Record<string, string> = {
      'AAPL': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories.',
      'MSFT': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.',
      'GOOGL': 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
      'AMZN': 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. It operates through three segments: North America, International, and Amazon Web Services (AWS).',
      'META': 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
      'TSLA': 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
      'NVDA': 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company operates through Graphics and Compute & Networking segments.',
      'JPM': 'JPMorgan Chase & Co. operates as a financial services company worldwide. It operates through four segments: Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management.',
      'V': 'Visa Inc. operates as a payments technology company worldwide. The company provides transaction processing services through VisaNet, a transaction processing network.',
      'JNJ': 'Johnson & Johnson, together with its subsidiaries, researches, develops, manufactures, and sells various products in the healthcare field worldwide. The company operates through three segments: Consumer Health, Pharmaceutical, and MedTech.',
      'WMT': 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide. The company operates through three segments: Walmart U.S., Walmart International, and Sam\'s Club.'
    };
    
    // Company sectors
    const sectors = ['Technology', 'Healthcare', 'Consumer Cyclical', 'Financial Services', 'Communication Services', 'Industrial', 'Energy'];
    
    // Company exchanges
    const exchanges = ['NASDAQ', 'NYSE', 'AMEX', 'LSE', 'TSX'];
    
    // Get or generate name and description based on symbol
    const name = companyNames[symbol] || `${symbol} Corporation`;
    const description = descriptions[symbol] || `${name} is a leading company operating in various sectors including technology, retail, and services. The company focuses on innovation and customer experience to drive growth and shareholder value.`;
    
    // Generate semi-random but stable values based on the symbol
    const sectorIndex = symbolValue % sectors.length;
    const exchangeIndex = (symbolValue * 3) % exchanges.length;
    
    const marketCap = (symbolValue * 10000000 + 1000000000).toString();
    const pe = ((symbolValue % 50) + 5).toFixed(2);
    const dividend = ((symbolValue % 10) / 10).toFixed(2);
    const eps = ((symbolValue % 20) + 0.5).toFixed(2);
    const beta = ((symbolValue % 30) / 10).toFixed(2);
    
    // Use the 52 week high/low from the quote data for consistency
    const quoteData = generateMockQuoteData(symbol);
    
    return {
      Symbol: symbol,
      Name: name,
      Description: description,
      Exchange: exchanges[exchangeIndex],
      Currency: 'USD',
      Country: 'United States',
      Sector: sectors[sectorIndex],
      Industry: 'Various',
      MarketCapitalization: marketCap,
      PERatio: pe,
      DividendYield: dividend,
      EPS: eps,
      Beta: beta,
      FiftyTwoWeekHigh: (quoteData.high52Week ?? 0).toString(),
      FiftyTwoWeekLow: (quoteData.low52Week ?? 0).toString()
    };
  }
  
  /**
   * Generate mock company news data
   */
  function generateMockCompanyNews(symbol: string): NewsArticle[] {
    // News sources
    const sources = ['Financial Times', 'Bloomberg', 'The Wall Street Journal', 'CNBC', 'Reuters', 'MarketWatch', 'Barron\'s', 'Investor\'s Business Daily'];
    
    // Company name for the news headlines
    const companyOverview = generateMockCompanyOverview(symbol);
    const companyName = companyOverview.Name;
    const shorterName = companyName.split(' ')[0]; // First word of company name
    
    // News article templates
    const newsTemplates = [
      { title: `${companyName} Reports Strong Quarterly Earnings, Beats Expectations`, summary: `${companyName} released its quarterly earnings report today, exceeding analyst expectations with revenue growth of 15% year-over-year.` },
      { title: `${shorterName} Announces New Product Line, Shares Rise`, summary: `${companyName} revealed its new product lineup today at an industry conference, leading to a 3% increase in share price.` },
      { title: `Investors Optimistic About ${shorterName}'s Growth Strategy`, summary: `Market analysts express confidence in ${companyName}'s long-term growth strategy following recent business developments and market expansion.` },
      { title: `${companyName} Expands into New Markets`, summary: `${companyName} announced plans to expand operations into emerging markets, with a focus on Asia and South America.` },
      { title: `${shorterName} CEO Discusses Future Vision in Interview`, summary: `In a recent interview, the CEO of ${companyName} outlined the company's vision for the next five years, highlighting innovation and sustainability initiatives.` },
      { title: `Analysts Upgrade ${symbol} Stock Rating`, summary: `Several major financial institutions have upgraded their rating for ${companyName}, citing strong fundamentals and growth potential.` },
      { title: `${companyName} Partners with Tech Giant for New Initiative`, summary: `${companyName} announced a strategic partnership today that aims to accelerate digital transformation and enhance customer experience.` },
      { title: `${shorterName} Addresses Supply Chain Challenges`, summary: `${companyName} executives detailed their strategy to mitigate ongoing supply chain disruptions during their annual investor meeting.` },
      { title: `${companyName} Increases Dividend by 10%`, summary: `The board of directors of ${companyName} approved a 10% increase in the quarterly dividend, reflecting confidence in the company's financial position.` },
      { title: `Market Watch: ${symbol} Technical Analysis Shows Bullish Trend`, summary: `Technical analysts point to several indicators suggesting a positive outlook for ${companyName}'s stock in the coming months.` }
    ];
    
    // Generate news articles
    return newsTemplates.map((template, index) => {
      // Generate a date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - (index % 30)); // Distribute over the last month
      
      return {
        title: template.title,
        url: `https://example.com/news/${symbol.toLowerCase()}/${date.getTime()}`,
        summary: template.summary,
        source: sources[index % sources.length],
        publishedAt: date.toISOString(),
        image: index % 3 === 0 ? `https://picsum.photos/seed/${symbol}${index}/800/400` : undefined // Only some articles have images
      };
    });
  }

/**
 * Generate mock market news (not specific to any company)
 */
function generateMockMarketNews(): NewsArticle[] {
  // News sources
  const sources = ['Financial Times', 'Bloomberg', 'The Wall Street Journal', 'CNBC', 'Reuters', 'MarketWatch', 'Barron\'s', 'Investor\'s Business Daily'];
  
  // Market news article templates
  const newsTemplates = [
    { title: 'Federal Reserve Signals Potential Rate Changes', summary: 'The Federal Reserve indicated it might adjust interest rates in response to recent economic data, according to minutes from the latest meeting.' },
    { title: 'S&P 500 Reaches New All-Time High', summary: 'The S&P 500 index surged to a record high today, driven by strong performance in technology and healthcare sectors.' },
    { title: 'Oil Prices Fluctuate Amid Global Supply Concerns', summary: 'Crude oil futures experienced volatility as traders assessed supply disruptions and potential demand changes in key markets.' },
    { title: 'Treasury Yields Rise on Economic Outlook', summary: 'Government bond yields climbed as investors reassess inflation expectations and economic growth forecasts.' },
    { title: 'Market Volatility Increases as Earnings Season Begins', summary: 'Stock market volatility metrics have risen as companies start to report quarterly earnings, with mixed results so far.' },
    { title: 'Tech Sector Leads Market Rally', summary: 'Technology stocks powered a broad market rally, with semiconductor and software companies posting significant gains.' },
    { title: 'GDP Growth Exceeds Expectations in Q2', summary: 'The economy grew faster than anticipated in the second quarter, according to preliminary data released by the Commerce Department.' },
    { title: 'Retail Sales Data Shows Consumer Resilience', summary: 'Monthly retail sales figures came in stronger than expected, suggesting consumer spending remains robust despite economic headwinds.' },
    { title: 'Gold Prices Reach Six-Month High', summary: 'Gold futures climbed to their highest level in six months as investors seek safe-haven assets amid economic uncertainty.' },
    { title: 'Housing Market Shows Signs of Cooling', summary: 'New home sales and mortgage applications declined last month, potentially signaling a moderation in the housing market.' },
    { title: 'Dollar Strengthens Against Major Currencies', summary: 'The U.S. dollar index rose against a basket of major currencies, reaching its highest level since January.' },
    { title: 'Inflation Data Comes in Below Expectations', summary: 'The latest Consumer Price Index report showed inflation easing slightly, providing some relief to markets concerned about persistent price pressures.' },
    { title: 'Market Analysts Divided on Year-End Outlook', summary: 'Wall Street strategists are showing unusual divergence in their forecasts for how markets will perform through the end of the year.' },
    { title: 'Small-Cap Stocks Outperform Broader Market', summary: 'Small-capitalization companies have outpaced their larger counterparts over the past month, potentially signaling a shift in market leadership.' },
    { title: 'Global Markets React to Central Bank Decisions', summary: 'International stock markets showed mixed reactions to policy announcements from major central banks around the world.' }
  ];
  
  // Generate news articles
  return newsTemplates.map((template, index) => {
    // Generate a date within the last 15 days
    const date = new Date();
    date.setDate(date.getDate() - (index % 15)); // Distribute over the last 15 days
    
    return {
      title: template.title,
      url: `https://example.com/market-news/${date.getTime()}`,
      summary: template.summary,
      source: sources[index % sources.length],
      publishedAt: date.toISOString(),
      image: index % 4 === 0 ? `https://picsum.photos/seed/market${index}/800/400` : undefined // Only some articles have images
    };
  });
}

export { generateMockCompanyOverview, generateMockCompanyNews, generateMockMarketNews };