'use client'

import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { useSymbols } from "@/contexts/SymbolsContext"
import { RootLayout } from "@/components/layout/root-layout"

export default function DashboardPage() {
  const { selectedSymbols } = useSymbols()

  return (
    <RootLayout>
      <div className="py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Compare and analyze selected securities. Add up to 5 symbols to visualize data.
          </p>
        </div>
        
        <DashboardContent />
      </div>
    </RootLayout>
  )
} 