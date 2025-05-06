import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LazyComponent() {
  const [loadTime, setLoadTime] = useState<number | null>(null)
  
  useEffect(() => {
    const now = performance.now()
    setLoadTime(now)
  }, [])
  
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle>Lazy-Loaded Component</CardTitle>
        <CardDescription>This component was loaded lazily</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground mb-4">
          This component was loaded using Next.js dynamic import. It has a 2-second artificial
          delay to demonstrate the loading state.
        </p>
        
        <div className="bg-green-50 p-4 rounded-md text-green-800 font-medium">
          I'm loaded lazily with dynamic import!
          {loadTime && (
            <div className="text-sm font-normal mt-2">
              Loaded at: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 