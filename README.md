# Equity Screener

A web-based platform for searching equities, viewing them in a rich table, drilling into detail pages, and exploring an interactive dashboard—all powered by the Alpha Vantage API.

## Features

- **Live Search**: Search for stocks, ETFs, and other securities with real-time suggestions as you type
- **Filtering Options**: Filter search results by type, region, or other relevant fields
- **Results Table**: View matches in a paginated table with extensive information
- **Interactive Dashboard**: Compare multiple symbols with interactive charts
- **Detail Pages**: Explore in-depth information for individual symbols
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI
- **Charts**: Recharts.js
- **Data**: Alpha Vantage API

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

3. Create a `.env.local` file in the root directory with your Alpha Vantage API key:

```
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### API Usage and Mock Data

The application uses the Alpha Vantage API for both symbol search and time series data:

- **Symbol Search API**: Used to find matching stocks, ETFs, and other securities
- **Time Series Monthly API**: Used to fetch monthly OHLCV price data for the dashboard charts

By default, the application prioritizes using the actual API when an API key is available. Mock data is only used as a fallback in the following cases:
- When no API key is provided
- When the API key is invalid or the API request fails
- When `NEXT_PUBLIC_USE_MOCK_DATA=true` is set in your environment (for testing/development)

**Note on API Limits**: The free tier of Alpha Vantage has a limit of 5 requests per minute and 500 requests per day. The app includes caching mechanisms to minimize API calls, but be aware of these limitations during use.

## Project Structure

- `/src/app`: Next.js pages and layouts
- `/src/components`: React components
  - `/ui`: ShadCN UI components
  - `/search`: Search-related components
- `/src/hooks`: Custom React hooks
- `/src/services`: API clients and service layers
- `/src/utils`: Utility functions and mock data
- `/public`: Static assets

## Architecture Decisions

- **Component Structure**: Components are organized by feature with separation of concerns
- **API Handling**: All API calls are abstracted into service modules with proper error handling
- **State Management**: React hooks and context for state management with minimal client components
- **TypeScript**: Strong typing throughout the application for better developer experience and code quality
- **Accessibility**: Components are designed with accessibility in mind, including proper ARIA attributes
- **Error Handling**: Comprehensive error handling for API requests and user interactions

