import React from 'react'
import { AlertCircle, XCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/api-client'

export type ErrorSeverity = 'error' | 'warning' | 'info'

export interface ErrorMessageProps {
  /**
   * The error message or object to display
   */
  error: string | Error | ApiError | null | undefined
  /**
   * Additional description to show below the main error
   */
  description?: string
  /**
   * The severity level of the error
   */
  severity?: ErrorSeverity
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string
  /**
   * Whether to show a retry button
   */
  showRetry?: boolean
  /**
   * Function to call when retry button is clicked
   */
  onRetry?: () => void
  /**
   * Function to call when dismiss button is clicked
   */
  onDismiss?: () => void
}

/**
 * ErrorMessage component for standardized error display across the application
 */
export function ErrorMessage({
  error,
  description,
  severity = 'error',
  className,
  showRetry = false,
  onRetry,
  onDismiss
}: ErrorMessageProps) {
  // If no error is provided, don't render anything
  if (!error) return null
  
  // Convert error to string message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
  
  // Map severity to variant, icon, and color
  const variantMap: Record<ErrorSeverity, {
    variant: 'default' | 'destructive',
    icon: LucideIcon,
    iconClass: string
  }> = {
    error: { 
      variant: 'destructive', 
      icon: XCircle,
      iconClass: 'text-destructive'
    },
    warning: { 
      variant: 'default', 
      icon: AlertTriangle,
      iconClass: 'text-amber-500'
    },
    info: { 
      variant: 'default', 
      icon: Info,
      iconClass: 'text-blue-500'
    }
  }
  
  // Get the variant and icon from the map
  const { variant, icon: Icon, iconClass } = variantMap[severity]
  
  return (
    <Alert 
      variant={variant} 
      className={cn("flex items-center", className)}
    >
      <Icon className={cn("h-4 w-4 mr-2", iconClass)} />
      <div className="flex-1">
        <AlertDescription className="font-medium">
          {errorMessage}
        </AlertDescription>
        {description && (
          <AlertDescription className="mt-1 text-sm">
            {description}
          </AlertDescription>
        )}
      </div>
      <div className="flex gap-2">
        {showRetry && onRetry && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onRetry}
            className="h-7 px-2 text-xs"
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onDismiss}
            className="h-7 px-2 text-xs"
          >
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  )
} 