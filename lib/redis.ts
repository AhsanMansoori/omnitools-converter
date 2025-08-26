import Redis from 'ioredis'

// Mock Redis implementation for development
class MockRedis {
  private data = new Map<string, string>()
  private subscribers = new Map<string, ((...args: unknown[]) => void)[]>()

  async ping() {
    return 'PONG'
  }

  async set(key: string, value: string) {
    this.data.set(key, value)
    return 'OK'
  }

  async get(key: string) {
    return this.data.get(key) || null
  }

  async del(key: string) {
    return this.data.delete(key) ? 1 : 0
  }

  async hset(key: string, field: string, value: string) {
    const existing = this.data.get(key)
    const hash = existing ? JSON.parse(existing) : {}
    hash[field] = value
    this.data.set(key, JSON.stringify(hash))
    return 1
  }

  async hget(key: string, field: string) {
    const existing = this.data.get(key)
    if (!existing) return null
    const hash = JSON.parse(existing)
    return hash[field] || null
  }

  async lpush(key: string, ...values: string[]) {
    const existing = this.data.get(key)
    const list = existing ? JSON.parse(existing) : []
    list.unshift(...values)
    this.data.set(key, JSON.stringify(list))
    return list.length
  }

  async brpop(key: string, timeout: number) {
    // Simplified implementation for testing
    // Note: timeout parameter is intentionally unused in mock
    const existing = this.data.get(key)
    if (!existing) return null
    const list = JSON.parse(existing)
    if (list.length === 0) return null
    const value = list.pop()
    this.data.set(key, JSON.stringify(list))
    return [key, value]
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    console.log(`Mock Redis: ${event} event registered`)
    // Note: callback parameter is intentionally unused in mock
    return this
  }

  async quit() {
    console.log('Mock Redis: Connection closed')
    return 'OK'
  }
}

let redis: Redis | MockRedis | null = null

export function getRedisConnection(): Redis | MockRedis {
  if (!redis) {
    // Check if we should use mock Redis for development
    if (process.env.REDIS_MODE === 'mock' || process.env.NODE_ENV === 'development') {
      console.log('Using Mock Redis for development')
      redis = new MockRedis()
      return redis
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })

    redis.on('error', (error) => {
      console.error('Redis connection error:', error)
      // Fall back to mock Redis on connection error
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to Mock Redis')
        redis = new MockRedis()
      }
    })

    redis.on('reconnecting', () => {
      console.log('Redis reconnecting...')
    })
  }

  return redis
}

// Export singleton instance
export default getRedisConnection()