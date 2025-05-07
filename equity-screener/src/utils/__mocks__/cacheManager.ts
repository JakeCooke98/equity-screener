export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheOptions {
  ttl?: number;
  useStaleOnError?: boolean;
}

/**
 * Mock CacheManager for testing
 */
export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTtl: number;

  constructor(defaultTtl = 600000) {
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
    
    // Spy on methods
    jest.spyOn(this, 'get');
    jest.spyOn(this, 'set');
    jest.spyOn(this, 'has');
    jest.spyOn(this, 'getOrFetch');
    jest.spyOn(this, 'clear');
    jest.spyOn(this, 'clearExpired');
  }

  get(key: string, options?: CacheOptions): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  set(key: string, data: T): CacheEntry<T> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);
    return entry;
  }

  has(key: string, options?: CacheOptions): boolean {
    return this.cache.has(key);
  }

  async getOrFetch(
    key: string, 
    fetchFn: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    const cachedData = this.get(key, options);
    if (cachedData !== null) {
      return cachedData;
    }
    
    const data = await fetchFn();
    this.set(key, data);
    return data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  clearExpired(ttl?: number): number {
    return 0; // Mock implementation just returns 0 cleared items
  }
} 