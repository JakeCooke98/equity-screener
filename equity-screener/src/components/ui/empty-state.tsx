import React from 'react'
import { LucideIcon, Info, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type EmptyStateType = 'default' | 'search' | 'error' | 'custom'

interface EmptyStateProps {
  /**
   * The title to display
   */
  title: string
  /**
   * The description to display
   */
  description?: string
  /**
   * The type of empty state
   */
  type?: EmptyStateType
  /**
   * Custom icon to display (overrides the default icon based on type)
   */
  icon?: LucideIcon
  /**
   * Action button label
   */
  actionLabel?: string
  /**
   * Function to call when action button is clicked
   */
  onAction?: () => void
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string
  /**
   * Height class to apply to the container
   */
  heightClass?: string
}

/**
 * EmptyState component for standardized empty state display across the application
 */
export function EmptyState({
  title,
  description,
  type = 'default',
  icon: CustomIcon,
  actionLabel,
  onAction,
  className,
  heightClass = 'h-60'
}: EmptyStateProps) {
  // Map type to icon
  const iconMap: Record<EmptyStateType, LucideIcon> = {
    default: Info,
    search: Search,
    error: AlertCircle,
    custom: CustomIcon || Info
  }
  
  // Get the icon from the map
  const Icon = CustomIcon || iconMap[type]
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-8",
        heightClass,
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3">
        <Icon className="h-10 w-10 text-muted-foreground/50" />
        <div className="space-y-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground max-w-md">
              {description}
            </p>
          )}
          {actionLabel && onAction && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAction} 
              className="mt-4"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 