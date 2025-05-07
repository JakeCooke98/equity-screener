import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LoadingSize = 'sm' | 'md' | 'lg'

interface LoadingIndicatorProps {
  /**
   * The size of the loading indicator
   */
  size?: LoadingSize
  /**
   * Text to display below the loading indicator
   */
  text?: string
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string
  /**
   * Height class to apply to the container
   */
  heightClass?: string
  /**
   * Center the loading indicator
   */
  center?: boolean
}

/**
 * LoadingIndicator component for standardized loading state display
 */
export function LoadingIndicator({
  size = 'md',
  text,
  className,
  heightClass,
  center = true
}: LoadingIndicatorProps) {
  // Map size to class
  const sizeMap: Record<LoadingSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  const loaderSize = sizeMap[size]
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center",
        center && "justify-center",
        heightClass,
        className
      )}
    >
      <Loader2 className={cn(loaderSize, "animate-spin text-primary")} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
} 