import { useState, useCallback, useEffect, useRef } from 'react'
import { ApiError } from '@/services/api-client'

/**
 * Status of the async operation
 */
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Options for the useAsync hook
 */
export interface UseAsyncOptions<T> {
  /**
   * Initial data to use before the async operation completes
   */
  initialData?: T
  /**
   * Whether to execute the async operation immediately
   */
  immediate?: boolean
  /**
   * Callback to run when the operation succeeds
   */
  onSuccess?: (data: T) => void
  /**
   * Callback to run when the operation fails
   */
  onError?: (error: Error | ApiError) => void
  /**
   * Dependencies to watch for changes to re-run the operation
   */
  deps?: any[]
}

/**
 * Hook to handle async operations with standardized loading, error, and data states
 * 
 * @param asyncFunction - The async function to execute
 * @param options - Options for the hook
 * @returns An object with the async state and execute function
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { 
    initialData,
    immediate = false,
    onSuccess,
    onError,
    deps = []
  } = options

  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<Error | ApiError | null>(null)

  // Refs to maintain the most recent function reference and avoid stale closures
  const asyncFunctionRef = useRef(asyncFunction)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  // Update refs when dependencies change
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  }, [asyncFunction, onSuccess, onError])

  // The execute function that will trigger the async operation
  const execute = useCallback(async (): Promise<T | undefined> => {
    setStatus('pending')
    setError(null)

    try {
      const result = await asyncFunctionRef.current()
      setData(result)
      setStatus('success')
      
      // Call onSuccess callback if provided
      onSuccessRef.current?.(result)
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error as Error | ApiError)
      setStatus('error')
      
      // Call onError callback if provided
      onErrorRef.current?.(error as Error | ApiError)
      
      return undefined
    }
  }, [])

  // Run the async function immediately if specified
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate, ...deps])

  // Reset the state on dependency changes if not running immediately
  useEffect(() => {
    if (!immediate) {
      setStatus('idle')
      setError(null)
    }
  }, deps)

  // Derived states for easier use
  const isIdle = status === 'idle'
  const isLoading = status === 'pending'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return {
    execute,
    status,
    data,
    error,
    isIdle,
    isLoading,
    isSuccess,
    isError,
    reset: useCallback(() => {
      setStatus('idle')
      setError(null)
      setData(initialData)
    }, [initialData])
  }
} 