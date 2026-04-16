import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'
import { createServiceLogger } from '@utils/logger.js'
import type { FastifyBaseLogger } from 'fastify'
import { LRUCache } from 'lru-cache'

const brotliCompressAsync = promisify(brotliCompress)
const gzipAsync = promisify(gzip)

export type Encoding = 'br' | 'gzip'

export interface CompressedBuffers {
  br: Buffer
  gzip: Buffer
}

const DEFAULT_MAX_ENTRIES = 100
const DEFAULT_MAX_SIZE = 200 * 1024 * 1024

interface ResponseCacheOptions {
  maxEntries: number
  maxSize: number
}

function entrySize(buffers: CompressedBuffers): number {
  return buffers.br.byteLength + buffers.gzip.byteLength
}

export class ResponseCacheService {
  private readonly cache: LRUCache<string, CompressedBuffers>
  private readonly log: FastifyBaseLogger

  constructor(
    baseLog: FastifyBaseLogger,
    options?: Partial<ResponseCacheOptions>,
  ) {
    this.log = createServiceLogger(baseLog, 'CACHE')
    this.cache = new LRUCache({
      max: options?.maxEntries ?? DEFAULT_MAX_ENTRIES,
      sizeCalculation: entrySize,
      maxSize: options?.maxSize ?? DEFAULT_MAX_SIZE,
      dispose: (_, key) => {
        this.log.debug({ key }, 'evicted entry')
      },
    })
  }

  get(key: string, encoding: Encoding): Buffer | undefined {
    const buffers = this.cache.get(key)
    if (!buffers) {
      this.log.debug({ key, encoding }, 'cache miss')
      return undefined
    }

    this.log.debug({ key, encoding }, 'cache hit')
    return buffers[encoding]
  }

  async set(key: string, json: string): Promise<CompressedBuffers> {
    const [br, gz] = await Promise.all([
      brotliCompressAsync(json, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 6 },
      }),
      gzipAsync(json),
    ])
    const buffers: CompressedBuffers = { br, gzip: gz }
    this.cache.set(key, buffers)
    this.log.debug(
      { key, brBytes: br.byteLength, gzipBytes: gz.byteLength },
      'cached compressed response',
    )
    return buffers
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.log.debug({ size: this.cache.size }, 'clearing cache')
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}
