# Equity Screener

A modern, feature-rich web application for searching, analyzing, and monitoring stocks and other financial instruments powered by Alpha Vantage API with real-time data visualization.

## Features

- **Advanced Symbol Search**: Search for stocks, ETFs, and other securities with real-time suggestions, filtering by asset type, region, and more
- **Market News**: View latest market news and symbol-specific news with comprehensive filtering
- **Interactive Dashboard**: Compare multiple symbols with responsive charts and performance metrics
- **Stock Details**: Deep dive into individual stocks with price charts, news, and company information
- **Favorites Management**: Save and track your favorite symbols across sessions 
- **Responsive Design**: Fully responsive UI that works seamlessly across desktop, tablet, and mobile
- **Optimized Performance**: Built with modern web techniques including lazy loading and efficient caching

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Components**: 
  - Shadcn UI
  - Radix UI for accessible primitives
  - Tailwind CSS 4 for styling
- **State Management**: React hooks and context
- **Data Fetching**: Custom async hooks with caching
- **Data Visualization**: Recharts for interactive charts
- **URL State Management**: nuqs for search parameters
- **Testing**: Jest and React Testing Library 
- **Icons**: Lucide React
- **Tables**: TanStack Table v8

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- An Alpha Vantage API key (free tier available at [Alpha Vantage](https://www.alphavantage.co/support/#api-key))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/equity-screener.git
cd equity-screener
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=https://www.alphavantage.co/query
NEXT_PUBLIC_USE_MOCK_DATA=false
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

6. Run tests:

```bash
npm test          # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Alpha Vantage API Usage

The application offers three modes of operation:

1. **Live API Mode**: Uses real Alpha Vantage API calls (default when API key is provided)
2. **Mock Data Mode**: Uses realistic mock data (activate by setting `NEXT_PUBLIC_USE_MOCK_DATA=true`)
3. **Fallback Mode**: Automatically falls back to mock data when API requests fail

**Note on API Limits**: Alpha Vantage's free tier has limits of 5 requests per minute and 500 requests per day. The application implements caching to minimize API calls and respect these limits.

## Project Structure

```
/src
  /app             # Next.js App Router pages and layouts
    /dashboard     # Dashboard page
    /favorites     # Favorites page
    /stock/[symbol]# Stock detail page
  /components      # React components organized by feature
    /dashboard     # Dashboard-specific components
    /favorites     # Favorites components
    /layout        # Layout components
    /news          # News components
    /search        # Search components
    /stock         # Stock detail components
    /table         # Table components
    /ui            # Shadcn UI components
  /contexts        # React contexts for state management
  /hooks           # Custom React hooks
  /lib             # Utility libraries and helpers
  /services        # API service layer
    /alphaVantage  # Alpha Vantage API client
  /utils           # Utility functions, caching, mock data
```

## Architecture Highlights

- **Component Architecture**: Feature-focused component organization with clear separation of concerns
- **Server/Client Components**: Leverages Next.js App Router with strategic use of server and client components
- **Data Management**:
  - Efficient caching with TTL support
  - Stale-while-revalidate pattern for better UX
  - Error handling with fallbacks
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA-compliant components using Radix UI primitives
- **Testing Strategy**: Unit tests with mocked services for predictable and fast testing