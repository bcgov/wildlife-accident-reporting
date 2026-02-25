import { gzipSync } from 'node:zlib'

interface CacheEntry {
  buffer: Buffer
  expiresAt: number
}

interface ResponseCacheOptions {
  ttlMs: number
  maxEntries: number
}

const DEFAULT_OPTIONS: ResponseCacheOptions = {
  ttlMs: 60 * 60 * 1000, // 1 hour
  maxEntries: 100,
}

export class ResponseCacheService {
  private readonly cache = new Map<string, CacheEntry>()
  private readonly ttlMs: number
  private readonly maxEntries: number

  constructor(options?: Partial<ResponseCacheOptions>) {
    this.ttlMs = options?.ttlMs ?? DEFAULT_OPTIONS.ttlMs
    this.maxEntries = options?.maxEntries ?? DEFAULT_OPTIONS.maxEntries
  }

  private pruneExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) this.cache.delete(key)
    }
  }

  get(key: string): Buffer | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    return entry.buffer
  }

  set(key: string, json: string): Buffer {
    if (!this.cache.has(key) && this.cache.size >= this.maxEntries) {
      this.pruneExpired()
    }
    if (!this.cache.has(key) && this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) this.cache.delete(oldestKey)
    }

    const buffer = gzipSync(json)
    this.cache.set(key, { buffer, expiresAt: Date.now() + this.ttlMs })
    return buffer
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}
