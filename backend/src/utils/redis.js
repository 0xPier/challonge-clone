const { createClient } = require('redis');

let redisClient = null;
let isReady = false;

/**
 * Initialize Redis client
 */
async function initRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max reconnection attempts reached');
            return new Error('Redis max reconnection attempts reached');
          }
          return retries * 100;
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isReady = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Connected and ready');
      isReady = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis: Reconnecting...');
      isReady = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't fail the app if Redis is unavailable
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is ready
 */
function isRedisReady() {
  return isReady && redisClient;
}

/**
 * Cache helper with automatic fallback
 */
async function cacheGet(key) {
  if (!isRedisReady()) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

/**
 * Set cache with TTL (in seconds)
 */
async function cacheSet(key, value, ttl = 3600) {
  if (!isRedisReady()) return false;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
}

/**
 * Delete cache key
 */
async function cacheDel(key) {
  if (!isRedisReady()) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
}

/**
 * Delete cache keys by pattern
 */
async function cacheDelPattern(pattern) {
  if (!isRedisReady()) return false;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis DEL pattern error:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isReady = false;
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  closeRedis
};
