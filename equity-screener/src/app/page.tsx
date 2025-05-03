import { SearchContainer } from "@/components/search/SearchContainer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 md:px-10">
        <h1 className="text-xl font-bold">Equity Screener</h1>
        <Button variant="outline" size="sm" asChild className="gap-1">
          <Link href="/dashboard">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Stock Finder</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Search for stocks, ETFs, and other securities using Alpha Vantage data.
            Get real-time information and detailed analytics.
          </p>
        </div>
        <SearchContainer />
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
  );
}
