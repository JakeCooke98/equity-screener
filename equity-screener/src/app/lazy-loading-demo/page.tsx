'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

// Define skeleton loaders for demonstration
function ComponentSkeleton() {
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 mt-1 animate-pulse"></div>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-4/5 animate-pulse"></div>
        <div className="h-16 bg-muted rounded w-full animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

function ImageSkeleton() {
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 mt-1 animate-pulse"></div>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-48 bg-muted rounded w-full animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

// Regular component for comparison
function RegularComponent() {
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle>Regular Component</CardTitle>
        <CardDescription>This component is loaded immediately</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground mb-4">
          This component is imported and loaded normally with the page, without any lazy loading.
          It appears immediately when the page renders.
        </p>
        <div className="bg-blue-50 p-4 rounded-md text-blue-800 font-medium">
          I'm immediately visible because I'm not lazy loaded!
        </div>
      </CardContent>
    </Card>
  )
}

// Components to lazy load

// 1. Using dynamic import with custom loading state - with simulated delay
const LazyComponent = dynamic(() => import('./components/LazyComponent'), {
  ssr: false
})

// Simulate a delay when displaying the LazyComponent
function DelayedLazyComponent() {
  const [showComponent, setShowComponent] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowComponent(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return showComponent ? <LazyComponent /> : <ComponentSkeleton />
}

// 2. Image with native lazy loading
function LazyImage() {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle>Lazy-Loaded Image</CardTitle>
        <CardDescription>Using native HTML loading="lazy" attribute</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground mb-4">This image uses the native HTML loading="lazy" attribute:</p>
        <div className="relative">
          {!loaded && (
            <div className="absolute inset-0">
              <ImageSkeleton />
            </div>
          )}
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
            alt="Lazy loaded image" 
            className={`w-full rounded-md transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// 3. On-Demand loading (button click)
function OnDemandLazyLoad() {
  const [showComponent, setShowComponent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Lazy load component only after button click
  const OnDemandComponent = dynamic(
    () => import('./components/OnDemandComponent'),
    {
      ssr: false
    }
  )
  
  const handleClick = () => {
    setIsLoading(true)
    // Simulate a delay for loading
    setTimeout(() => {
      setShowComponent(true)
      setIsLoading(false)
    }, 1500)
  }
  
  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle>On-Demand Loading</CardTitle>
        <CardDescription>Load component only when requested</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-muted-foreground mb-4">This component is loaded only when the button is clicked:</p>
        
        {!showComponent ? (
          <div>
            <Button 
              onClick={handleClick}
              className="mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load Component'}
            </Button>
            
            {isLoading && <ComponentSkeleton />}
          </div>
        ) : (
          <OnDemandComponent />
        )}
      </CardContent>
    </Card>
  )
}

export default function LazyLoadingDemoPage() {
  const [loadStartTime, setLoadStartTime] = useState<number>(0)
  const [elapsed, setElapsed] = useState<number | null>(null)
  
  // Measure page load time
  useEffect(() => {
    const startTime = performance.now()
    setLoadStartTime(startTime)
    
    return () => {
      const endTime = performance.now()
      setElapsed(endTime - startTime)
    }
  }, [])
  
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
              Back to Home
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Lazy Loading Demo</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            This page demonstrates different types of lazy loading techniques in React and Next.js
          </p>
          
          {elapsed && (
            <div className="text-sm text-muted-foreground">
              Page rendered in: <span className="font-mono">{elapsed.toFixed(2)}ms</span>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regular component */}
            <RegularComponent />
            
            {/* Dynamic import with custom loading state */}
            <DelayedLazyComponent />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lazy loaded image */}
            <LazyImage />
            
            {/* On-demand lazy loading */}
            <OnDemandLazyLoad />
          </div>
        </div>
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