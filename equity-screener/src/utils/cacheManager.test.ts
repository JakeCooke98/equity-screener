import { CacheManager } from './cacheManager';

describe('CacheManager', () => {
  let cacheManager: CacheManager<any>;
  
  beforeEach(() => {
    jest.useFakeTimers();
    cacheManager = new CacheManager<any>(1000); // 1 second TTL for testing
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Set and Get', () => {
    it('should store and retrieve a value', () => {
      cacheManager.set('test-key', 'test-value');
      expect(cacheManager.get('test-key')).toBe('test-value');
    });

    it('should return null for non-existent keys', () => {
      expect(cacheManager.get('non-existent')).toBeNull();
    });
  });

  describe('Expiration', () => {
    it('should return null for expired keys', () => {
      cacheManager.set('test-key', 'test-value');
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1500);
      
      // Should return null because the entry is expired
      expect(cacheManager.get('test-key')).toBeNull();
    });

    it('should not expire keys before TTL', () => {
      cacheManager.set('test-key', 'test-value');
      
      // Fast-forward time but not past TTL
      jest.advanceTimersByTime(500);
      
      // Should still return the value
      expect(cacheManager.get('test-key')).toBe('test-value');
    });

    it('should honor custom TTL', () => {
      // Set with default TTL (1 second)
      cacheManager.set('normal-key', 'normal-value');
      
      // Custom get with short TTL (300ms)
      jest.advanceTimersByTime(500);
      expect(cacheManager.get('normal-key', { ttl: 300 })).toBeNull();
      
      // Can still get with default TTL
      expect(cacheManager.get('normal-key')).toBe('normal-value');
      
      // Now advance past default TTL
      jest.advanceTimersByTime(600); // Total 1100ms
      expect(cacheManager.get('normal-key')).toBeNull();
    });
  });

  describe('UseStaleOnError Option', () => {
    it('should return stale data when useStaleOnError is true', () => {
      cacheManager.set('test-key', 'stale-value');
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1500);
      
      // Should return stale data because useStaleOnError is true
      expect(cacheManager.get('test-key', { useStaleOnError: true })).toBe('stale-value');
      
      // Without useStaleOnError, it would return null
      expect(cacheManager.get('test-key')).toBeNull();
    });
  });

  describe('Has', () => {
    it('should return true for unexpired keys', () => {
      cacheManager.set('test-key', 'test-value');
      expect(cacheManager.has('test-key')).toBe(true);
    });

    it('should return false for expired keys', () => {
      cacheManager.set('test-key', 'test-value');
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1500);
      
      expect(cacheManager.has('test-key')).toBe(false);
    });

    it('should return false for non-existent keys', () => {
      expect(cacheManager.has('non-existent')).toBe(false);
    });
  });

  describe('GetOrFetch', () => {
    it('should return cached value when available', async () => {
      cacheManager.set('test-key', 'cached-value');
      
      const fetchFn = jest.fn().mockResolvedValue('fetched-value');
      const result = await cacheManager.getOrFetch('test-key', fetchFn);
      
      expect(result).toBe('cached-value');
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should call fetch function when value not cached', async () => {
      const fetchFn = jest.fn().mockResolvedValue('fetched-value');
      const result = await cacheManager.getOrFetch('test-key', fetchFn);
      
      expect(result).toBe('fetched-value');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should call fetch function when value is expired', async () => {
      cacheManager.set('test-key', 'cached-value');
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1500);
      
      const fetchFn = jest.fn().mockResolvedValue('fetched-value');
      const result = await cacheManager.getOrFetch('test-key', fetchFn);
      
      expect(result).toBe('fetched-value');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should use stale data on fetch error if configured', async () => {
      cacheManager.set('test-key', 'stale-value');
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1500);
      
      const fetchError = new Error('Fetch failed');
      const fetchFn = jest.fn().mockRejectedValue(fetchError);
      
      // Without useStaleOnError, the error should propagate
      await expect(cacheManager.getOrFetch('test-key', fetchFn)).rejects.toThrow(fetchError);
      
      // With useStaleOnError, it should return the stale value
      const result = await cacheManager.getOrFetch('test-key', fetchFn, { useStaleOnError: true });
      expect(result).toBe('stale-value');
      // The fetch function is called once per getOrFetch call
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Clear', () => {
    it('should clear a specific key', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      
      cacheManager.clear('key1');
      
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');
    });

    it('should clear all keys when no key provided', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      
      cacheManager.clear();
      
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
    });
  });

  describe('ClearExpired', () => {
    it('should clear only expired keys', () => {
      // Set up a few values
      cacheManager.set('expired-key', 'expired-value');
      
      // Advance time partially
      jest.advanceTimersByTime(500);
      
      // Set another value (will expire later than the first)
      cacheManager.set('valid-key', 'valid-value');
      
      // Advance time so 'expired-key' is expired but 'valid-key' is not
      jest.advanceTimersByTime(600); // Total 1100ms
      
      // Clear expired entries
      const cleared = cacheManager.clearExpired();
      
      expect(cleared).toBe(1);
      expect(cacheManager.get('expired-key')).toBeNull();
      expect(cacheManager.get('valid-key')).toBe('valid-value');
    });

    it('should use custom TTL for clearing', () => {
      // Set up multiple values
      cacheManager.set('old-key', 'old-value');
      
      // Advance time a bit
      jest.advanceTimersByTime(200);
      
      cacheManager.set('newer-key', 'newer-value');
      
      // Advance time a bit more
      jest.advanceTimersByTime(200); // Total 400ms
      
      cacheManager.set('newest-key', 'newest-value');
      
      // None should be expired under default TTL (1000ms)
      expect(cacheManager.clearExpired()).toBe(0);
      
      // With a custom TTL of 300ms, the 'old-key' should be cleared
      expect(cacheManager.clearExpired(300)).toBe(1);
      expect(cacheManager.get('old-key')).toBeNull();
      expect(cacheManager.get('newer-key')).toBe('newer-value');
      expect(cacheManager.get('newest-key')).toBe('newest-value');
      
      // With a custom TTL of 100ms, all remaining keys should be cleared
      // But since we already deleted 'old-key', only 'newer-key' and 'newest-key' remain
      expect(cacheManager.clearExpired(100)).toBe(1);
      expect(cacheManager.get('newer-key')).toBeNull();
      // 'newest-key' isn't expired yet with 100ms TTL since it was added later
      expect(cacheManager.get('newest-key')).toBe('newest-value');
    });
  });
}); 