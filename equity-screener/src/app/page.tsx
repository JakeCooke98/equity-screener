import { SearchContainer } from "@/components/search/SearchContainer";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-6 gap-8">
      <header className="w-full max-w-7xl flex flex-col items-center gap-6 pt-8">
        <h1 className="text-3xl font-bold">Equity Screener</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Search for stocks, ETFs, and other securities using Alpha Vantage data.
          Get real-time information and detailed analytics.
        </p>
      </header>
      
      <main className="w-full max-w-3xl flex flex-col gap-8">
        <SearchContainer />
        
        {/* Results table will be added in step 2 */}
      </main>
      
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <p>Powered by Alpha Vantage API</p>
      </footer>
    </div>
  );
}
