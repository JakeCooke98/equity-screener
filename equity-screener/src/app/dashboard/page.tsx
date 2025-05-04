'use client'

import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { useSymbols } from "@/contexts/SymbolsContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const { selectedSymbols } = useSymbols()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 md:px-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Equity Screener</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="gap-1"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Compare and analyze selected securities. Add up to 5 symbols to visualize data.
          </p>
        </div>
        
        <DashboardContent />
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
  )
} 