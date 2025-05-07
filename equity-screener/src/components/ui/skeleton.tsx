import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  /**
   * The className of the skeleton.
   */
  className?: string
  /**
   * Whether to show the skeleton as a circle.
   */
  circle?: boolean
  /**
   * The width of the skeleton.
   */
  width?: string | number
  /**
   * The height of the skeleton.
   */
  height?: string | number
  /**
   * Whether to show the skeleton in a row with a space between.
   */
  row?: boolean
  /**
   * The count of skeletons to render.
   */
  count?: number
}

/**
 * Skeleton component for showing loading states
 */
export function Skeleton({
  className,
  circle = false,
  width,
  height,
  row = false,
  count = 1,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  // Convert dimensions to appropriate CSS strings
  const widthStyle = width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined
  const heightStyle = height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined
  
  // Render multiple skeletons if count is greater than 1
  if (count > 1) {
    return (
      <div className={cn(
        row ? "flex items-center space-x-4" : "space-y-4",
        className
      )}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            circle={circle}
            width={width}
            height={height}
            className={row ? "" : className}
            {...props}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        circle && "rounded-full",
        className
      )}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
      {...props}
    />
  )
}

/**
 * SkeletonNews component for showing loading states for news cards
 */
export function SkeletonNews({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 border rounded-lg p-4">
          <Skeleton height={160} className="w-full rounded-md" />
          <Skeleton height={20} className="w-3/4" />
          <Skeleton height={14} className="w-1/4" />
          <div className="space-y-2">
            <Skeleton height={12} className="w-full" />
            <Skeleton height={12} className="w-full" />
            <Skeleton height={12} className="w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonSymbolTable component for showing loading states for symbol tables
 */
export function SkeletonSymbolTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={16} className={`w-${i === 0 ? 16 : 20}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          {Array.from({ length: 8 }).map((_, j) => (
            <Skeleton key={j} height={16} className={`w-${j === 0 ? 16 : 20}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonChart component for showing loading states for charts
 */
export function SkeletonChart() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton width={150} height={20} />
        <div className="flex space-x-2">
          <Skeleton width={60} height={32} />
          <Skeleton width={60} height={32} />
        </div>
      </div>
      <Skeleton height={300} className="w-full" />
      <div className="flex justify-between">
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
      </div>
    </div>
  )
} 