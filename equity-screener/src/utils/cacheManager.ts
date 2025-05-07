/**
 * Generic cache manager for storing API responses and other data.
 * 
 * This utility provides a consistent caching mechanism across the application with features like:
 * - Time-based expiration (TTL)
 * - Stale-while-revalidate pattern
 * - Fallback to stale data on errors
 * - Cache key management
 * - Lazy data fetching
 * 
 * @module CacheManager
 */

// Default cache expiry time (10 minutes)
const DEFAULT_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Represents a single entry in the cache
 * @template T - The type of data being cached
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Options for cache operations
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds. Defaults to the CacheManager's default TTL. */
  ttl?: number;
  /** Whether to return stale data if fetch fails or data is expired. Defaults to false. */
  useStaleOnError?: boolean;
}

/**
 * A generic caching utility for managing data with time-based expiration.
 * 
 * This class provides methods for storing, retrieving, and managing cached data
 * with support for time-to-live (TTL), fallback to stale data, and cache invalidation.
 * 
 * @example
 * ```typescript
 * // Create a cache for user data that expires after 5 minutes
 * const userCache = new CacheManager<User>(5 * 60 * 1000);
 * 
 * // Get or fetch user data
 * const user = await userCache.getOrFetch(
 *   `user-${userId}`,
 *   () => fetchUserFromApi(userId),
 *   { useStaleOnError: true }
 * );
 * ```
 * 
 * @template T - The type of data being cached
 */
export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTtl: number;

  /**
   * Creates a new CacheManager instance
   * 
   * @param defaultTtl - Default time-to-live in milliseconds for cache entries
   */
  constructor(defaultTtl = DEFAULT_EXPIRY_MS) {
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Get an item from the cache if it exists and is not expired
   * 
   * @param key - Cache key to look up
   * @param options - Cache options to customize behavior
   * @returns The cached item or null if not found or expired (unless useStaleOnError is true)
   */
  get(key: string, options?: CacheOptions): T | null {
    const entry = this.cache.get(key);
    const ttl = options?.ttl ?? this.defaultTtl;
    
    if (!entry) {
      return null;
    }
    
    // Check if the entry is expired
    if (Date.now() - entry.timestamp > ttl) {
      // If we don't want to use stale data, return null
      if (!options?.useStaleOnError) {
        return null;
      }
      
      // Return the stale data if we want to use it
      console.log(`Using stale cache data for key: ${key}`);
    }
    
    return entry.data;
  }

  /**
   * Store an item in the cache
   * 
   * @param key - Cache key to store the data under
   * @param data - Data to cache
   * @returns The created cache entry
   */
  set(key: string, data: T): CacheEntry<T> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    
    this.cache.set(key, entry);
    return entry;
  }

  /**
   * Check if the cache has a valid (not expired) entry for the key
   * 
   * @param key - Cache key to check
   * @param options - Cache options to customize behavior
   * @returns Whether the cache has a valid entry
   */
  has(key: string, options?: CacheOptions): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const ttl = options?.ttl ?? this.defaultTtl;
    return Date.now() - entry.timestamp <= ttl;
  }

  /**
   * Get an item from the cache or call the fetch function to get it.
   * This implements the cache-then-network pattern.
   * 
   * @param key - Cache key to look up
   * @param fetchFn - Function to call if the item is not in the cache or is expired
   * @param options - Cache options to customize behavior
   * @returns The cached item or the result of the fetch function
   * @throws Will rethrow any error from the fetch function unless useStaleOnError is true
   */
  async getOrFetch(
    key: string, 
    fetchFn: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = this.get(key, options);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    try {
      // Fetch new data
      const data = await fetchFn();
      
      // Cache the new data
      this.set(key, data);
      
      return data;
    } catch (error) {
      // On error, check if we can use stale data
      if (options?.useStaleOnError) {
        const entry = this.cache.get(key);
        
        if (entry) {
          console.log(`Using stale cache data for key: ${key} after fetch error`);
          return entry.data;
        }
      }
      
      // Re-throw the error if we can't use stale data
      throw error;
    }
  }

  /**
   * Clear the entire cache or a specific key
   * 
   * @param key - Optional key to clear, if not provided the entire cache is cleared
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all expired entries from the cache
   * 
   * @param ttl - Custom TTL to use instead of the default
   * @returns Number of entries cleared
   */
  clearExpired(ttl?: number): number {
    const expiryTime = Date.now() - (ttl ?? this.defaultTtl);
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < expiryTime) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }
} 