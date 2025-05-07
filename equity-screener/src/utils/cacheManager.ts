/**
 * Generic cache manager for storing API responses and other data
 * Provides consistent caching across the application
 */

// Default cache expiry time (10 minutes)
const DEFAULT_EXPIRY_MS = 10 * 60 * 1000;

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheOptions {
  /** Time-to-live in milliseconds */
  ttl?: number;
  /** Whether to use stale data if fetch fails */
  useStaleOnError?: boolean;
}

export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTtl: number;

  constructor(defaultTtl = DEFAULT_EXPIRY_MS) {
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Get an item from the cache
   * @param key Cache key
   * @param options Cache options
   * @returns The cached item or null if not found or expired
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
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @returns The cache entry
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
   * @param key Cache key
   * @param options Cache options
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
   * Get an item from the cache or call the fetch function to get it
   * @param key Cache key
   * @param fetchFn Function to call if the item is not in the cache
   * @param options Cache options
   * @returns The cached item or the result of the fetch function
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
   * @param key Optional key to clear
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
   * @param ttl Custom TTL to use instead of the default
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