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

### Using Mock Data

During development, you can use mock data to avoid hitting the Alpha Vantage API rate limits:

- The app will automatically use mock data if no API key is provided in development mode.
- To use the actual API, make sure to add your API key to the `.env.local` file.

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

