import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    const { result } = renderHook(() => useAsync(asyncFunction));

    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should use initialData if provided', () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    const { result } = renderHook(() => useAsync(asyncFunction, {
      initialData: 'initial-data'
    }));

    expect(result.current.data).toBe('initial-data');
  });

  it('should execute immediately if immediate is true', async () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    
    const { result } = renderHook(() => useAsync(asyncFunction, {
      immediate: true
    }));

    // Should be in loading state initially
    expect(result.current.isLoading).toBe(true);
    
    // Wait for promise to resolve
    await act(async () => {
      await Promise.resolve();
    });
    
    // Should be in success state with data
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('test-data');
    expect(asyncFunction).toHaveBeenCalledTimes(1);
  });

  it('should not execute if immediate is false', () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    
    renderHook(() => useAsync(asyncFunction, {
      immediate: false
    }));
    
    expect(asyncFunction).not.toHaveBeenCalled();
  });

  it('should transition states on manual execute', async () => {
    // Create a promise that we can resolve manually
    let promiseResolve: (value: any) => void;
    const promise = new Promise((resolve) => {
      promiseResolve = resolve;
    });
    
    const asyncFunction = jest.fn().mockImplementation(() => promise);
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    // Initially idle
    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    
    // Start execution
    let executePromise: Promise<any>;
    act(() => {
      executePromise = result.current.execute();
    });
    
    // Should be in loading state
    expect(result.current.status).toBe('pending');
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the promise
    await act(async () => {
      promiseResolve!('test-data');
      await executePromise;
    });
    
    // Should be in success state with data
    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('test-data');
  });

  it('should handle errors correctly', async () => {
    const testError = new Error('Test error');
    
    // Create a promise that we can reject manually
    let promiseReject: (reason: any) => void;
    const promise = new Promise((resolve, reject) => {
      promiseReject = reject;
    });
    
    const asyncFunction = jest.fn().mockImplementation(() => promise);
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    // Start execution
    let executePromise: Promise<any>;
    act(() => {
      executePromise = result.current.execute().catch(() => {});
    });
    
    // Should be in loading state
    expect(result.current.isLoading).toBe(true);
    
    // Reject the promise
    await act(async () => {
      promiseReject!(testError);
      try {
        await executePromise;
      } catch (e) {
        // Ignore the error
      }
    });
    
    // Should be in error state
    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(testError);
    expect(result.current.data).toBeUndefined();
  });

  it('should call onSuccess callback when successful', async () => {
    const onSuccess = jest.fn();
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    
    const { result } = renderHook(() => useAsync(asyncFunction, {
      onSuccess
    }));
    
    // Call execute
    await act(async () => {
      await result.current.execute();
    });
    
    // onSuccess should have been called with the data
    expect(onSuccess).toHaveBeenCalledWith('test-data');
  });

  it('should call onError callback when fails', async () => {
    const testError = new Error('Test error');
    const onError = jest.fn();
    const asyncFunction = jest.fn().mockRejectedValue(testError);
    
    const { result } = renderHook(() => useAsync(asyncFunction, {
      onError
    }));
    
    // Call execute
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Ignore the error
      }
    });
    
    // onError should have been called with the error
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should reset state correctly', async () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    
    const { result } = renderHook(() => useAsync(asyncFunction, {
      initialData: 'initial-data'
    }));
    
    // Call execute
    await act(async () => {
      await result.current.execute();
    });
    
    // Should have data
    expect(result.current.data).toBe('test-data');
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    // Should be back to initial state
    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBe('initial-data');
    expect(result.current.error).toBeNull();
  });

  it('should re-execute when deps change', async () => {
    const asyncFunction = jest.fn().mockResolvedValue('test-data');
    
    const { result, rerender } = renderHook(
      ({ deps }) => useAsync(asyncFunction, { immediate: true, deps: [deps] }),
      { initialProps: { deps: 1 } }
    );
    
    // Wait for initial execution
    await act(async () => {
      await Promise.resolve();
    });
    
    // Should have been called once
    expect(asyncFunction).toHaveBeenCalledTimes(1);
    
    // Change deps
    rerender({ deps: 2 });
    
    // Wait for second execution
    await act(async () => {
      await Promise.resolve();
    });
    
    // Should have been called again
    expect(asyncFunction).toHaveBeenCalledTimes(2);
  });
}); 