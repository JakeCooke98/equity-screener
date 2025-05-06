import { SearchContainer } from "@/components/search/SearchContainer";
import { RootLayout } from "@/components/layout/root-layout";

export default function Home() {
  return (
    <RootLayout>
      <div className="py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Stock Finder</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Search for stocks, ETFs, and other securities using Alpha Vantage data.
            Get real-time information and detailed analytics.
          </p>
        </div>
        <SearchContainer />
      </div>
    </RootLayout>
  );
}
