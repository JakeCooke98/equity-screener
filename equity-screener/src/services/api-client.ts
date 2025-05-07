/**
 * Base API Client
 * 
 * This provides a foundation for all API clients with common functionality like:
 * - Request handling with proper typing
 * - Error standardization
 * - Response validation
 * - Request throttling/debouncing
 */

// Standard error interface across all API operations
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Cache options for API requests
export interface CacheOptions {
  // Enable/disable caching for this request
  enabled: boolean;
  // Time to live in milliseconds (default: 5 minutes)
  ttl?: number;
}

// Default cache TTL: 5 minutes
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// Simple in-memory cache implementation
export class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  // Add an item to the cache
  set(key: string, data: any, ttl = DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get an item from the cache if it exists and hasn't expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  // Remove an item from the cache
  remove(key: string): void {
    this.cache.delete(key);
  }

  // Clear all items from the cache
  clear(): void {
    this.cache.clear();
  }

  // Get the total number of cached items
  get size(): number {
    return this.cache.size;
  }
}

// Base API client class
export class ApiClient {
  // Base URL for all API requests
  protected baseUrl: string;
  // API key if required
  protected apiKey?: string;
  // Cache instance
  protected cache: ApiCache;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.cache = new ApiCache();
  }

  // Generic method to make API requests with proper caching
  protected async request<T>(
    endpoint: string,
    params: Record<string, string> = {},
    cacheOptions: CacheOptions = { enabled: true }
  ): Promise<T> {
    // Build URL with all parameters
    const url = new URL(endpoint, this.baseUrl);
    
    // Add API key if available
    if (this.apiKey) {
      params.apikey = this.apiKey;
    }
    
    // Add all parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    // Generate cache key from URL
    const cacheKey = url.toString();
    
    // Check cache first if enabled
    if (cacheOptions.enabled) {
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw this.createError(
          `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();

      // Check for API error response ("Error Message" is specific to Alpha Vantage)
      if ('Error Message' in data) {
        throw this.createError(data['Error Message'] as string);
      }
      
      // Check for API information response (also specific to Alpha Vantage)
      if ('Information' in data) {
        throw this.createError(data['Information'] as string, undefined, 'API_LIMIT_REACHED');
      }
      
      // Check for API note response (also specific to Alpha Vantage)
      if ('Note' in data && !('bestMatches' in data) && !('Monthly Time Series' in data) && !('Symbol' in data)) {
        throw this.createError(data['Note'] as string, undefined, 'API_LIMIT_REACHED');
      }

      // Cache the result if caching is enabled
      if (cacheOptions.enabled) {
        this.cache.set(cacheKey, data, cacheOptions.ttl || DEFAULT_CACHE_TTL);
      }

      return data as T;
    } catch (error) {
      // Re-throw if it's already an ApiError
      if ((error as ApiError).message) {
        throw error;
      }
      
      // Otherwise, create and throw a new ApiError
      throw this.createError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  // Standardize error creation
  protected createError(message: string, status?: number, code?: string): ApiError {
    return { message, status, code };
  }

  // Clear all cached data
  public clearCache(): void {
    this.cache.clear();
  }
} 