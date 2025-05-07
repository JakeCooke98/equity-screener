import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for the Skeleton component
 */
interface SkeletonProps {
  /**
   * Additional CSS classes to apply to the skeleton
   */
  className?: string
  /**
   * Whether to render the skeleton as a circle
   * @default false
   */
  circle?: boolean
  /**
   * Width of the skeleton (number in pixels or CSS string)
   */
  width?: string | number
  /**
   * Height of the skeleton (number in pixels or CSS string)
   */
  height?: string | number
  /**
   * Whether to arrange multiple skeletons horizontally in a row
   * @default false
   */
  row?: boolean
  /**
   * Number of skeleton elements to render
   * @default 1
   */
  count?: number
}

/**
 * Skeleton component for displaying loading states.
 * 
 * This component renders a placeholder with a pulse animation that can be
 * used while content is being loaded. It supports customizing dimensions,
 * arrangement, and can render multiple instances.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton height={20} className="w-full" />
 * 
 * // Multiple skeletons in a row
 * <Skeleton height={24} row count={3} />
 * 
 * // Avatar placeholder
 * <Skeleton circle width={40} height={40} />
 * ```
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
 * Skeleton component specifically designed for news articles loading states.
 * 
 * This component renders a grid of skeleton cards that mimic the layout of news articles,
 * including image placeholders, headlines, timestamps, and article summaries.
 * 
 * @example
 * ```tsx
 * // Default usage with 6 news items
 * <SkeletonNews />
 * 
 * // Custom number of news items
 * <SkeletonNews count={3} />
 * ```
 * 
 * @param props - Component props
 * @param props.count - Number of news article skeletons to render (default: 6)
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
 * Skeleton component for displaying a loading state for data tables.
 * 
 * This component renders a table-like structure with header skeletons and
 * row skeletons to represent a loading state for tabular data such as
 * search results or stock listings.
 * 
 * @example
 * ```tsx
 * // Default usage with 5 rows
 * <SkeletonSymbolTable />
 * 
 * // Custom number of rows
 * <SkeletonSymbolTable rows={10} />
 * ```
 * 
 * @param props - Component props
 * @param props.rows - Number of table rows to render as skeletons (default: 5)
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
 * Skeleton component for displaying a loading state for charts and graphs.
 * 
 * This component renders a placeholder for charts that includes a simulated
 * header with title and control buttons, the main chart area, and x-axis labels.
 * Use this when loading financial charts or other data visualizations.
 * 
 * @example
 * ```tsx
 * // Usage in a chart container
 * {isLoading ? <SkeletonChart /> : <ActualChart data={data} />}
 * ```
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