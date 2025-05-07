import React from 'react'
import { Search, Ban, Inbox, AlertCircle, FileQuestion, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Types of empty states available in the application
 * - search: No search results found
 * - noData: No data available for the current view
 * - noAccess: User doesn't have access to the resource
 * - error: Something went wrong
 * - empty: Generic empty state
 */
export type EmptyStateType = 'search' | 'noData' | 'noAccess' | 'error' | 'empty'

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  /**
   * The title to display in the empty state
   */
  title: string
  /**
   * Optional description to provide more context
   */
  description?: string
  /**
   * Type of empty state which determines the icon shown
   * @default 'empty'
   */
  type?: EmptyStateType
  /**
   * Custom icon to override the default icon for the type
   */
  icon?: LucideIcon
  /**
   * Text for the action button
   */
  actionLabel?: string
  /**
   * Function to call when the action button is clicked
   */
  onAction?: () => void
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string
  /**
   * CSS class for controlling the height of the empty state
   */
  heightClass?: string
}

/**
 * EmptyState component for displaying consistent empty state messages across the application.
 * 
 * This component is used when there is no data to display in a section of the UI.
 * It provides a consistent way to communicate this to the user with appropriate
 * styling and iconography based on the context (search results, no data, errors, etc).
 * 
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState 
 *   title="No results found" 
 *   description="Try adjusting your search or filters"
 *   type="search"
 * />
 * 
 * // Empty state with action
 * <EmptyState
 *   title="No favorites yet"
 *   description="Add stocks to your favorites to see them here"
 *   type="empty"
 *   actionLabel="Browse Stocks"
 *   onAction={() => router.push('/stocks')}
 * />
 * 
 * // Error state
 * <EmptyState
 *   title="Could not load data"
 *   description="Please try again later"
 *   type="error"
 *   actionLabel="Retry"
 *   onAction={handleRetry}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  type = 'empty',
  icon: CustomIcon,
  actionLabel,
  onAction,
  className,
  heightClass = 'min-h-[200px]'
}: EmptyStateProps) {
  // Map of empty state types to icons
  const iconMap: Record<EmptyStateType, LucideIcon> = {
    search: Search,
    noData: Inbox,
    noAccess: Ban,
    error: AlertCircle,
    empty: FileQuestion
  }
  
  // Check that the icon is valid before using it
  const Icon = CustomIcon || (type && iconMap[type]) || FileQuestion
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-6",
        heightClass,
        className
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
} 