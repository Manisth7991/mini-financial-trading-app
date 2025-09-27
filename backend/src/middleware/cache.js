// Simple in-memory cache as Redis alternative for development
// In production, replace with actual Redis implementation

class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }

    set(key, value, ttlSeconds = 300) {
        // Clear existing timer if key exists
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        // Set value
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });

        // Set expiration timer
        if (ttlSeconds > 0) {
            const timer = setTimeout(() => {
                this.delete(key);
            }, ttlSeconds * 1000);

            this.timers.set(key, timer);
        }
    }

    get(key) {
        const item = this.cache.get(key);
        return item ? item.value : null;
    }

    delete(key) {
        // Clear timer
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }

        // Delete from cache
        return this.cache.delete(key);
    }

    clear() {
        // Clear all timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();

        // Clear cache
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    keys() {
        return Array.from(this.cache.keys());
    }
}

// Create singleton instance
const cache = new SimpleCache();

// Cache middleware factory
const cacheMiddleware = (keyPrefix = '', ttlSeconds = 300) => {
    return (req, res, next) => {
        // Generate cache key based on URL and query params
        const cacheKey = `${keyPrefix}:${req.originalUrl}`;

        // Try to get from cache
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.json(cached);
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function (data) {
            // Only cache successful responses
            if (res.statusCode === 200 && data.success) {
                console.log(`Caching: ${cacheKey}`);
                cache.set(cacheKey, data, ttlSeconds);
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

// Clear cache for specific patterns
const clearCachePattern = (pattern) => {
    const keys = cache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));

    matchedKeys.forEach(key => {
        cache.delete(key);
        console.log(`Cleared cache: ${key}`);
    });

    return matchedKeys.length;
};

module.exports = {
    cache,
    cacheMiddleware,
    clearCachePattern
};