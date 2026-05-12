import type { TileSessionQuery } from '@schemas/maps/session.schema.js'
import { createServiceLogger } from '@utils/logger.js'
import type { FastifyBaseLogger, FastifyInstance } from 'fastify'

interface CachedSession {
  session: string
  expiry: number
}

interface SessionRequestBody {
  mapType: string
  language: string
  region: string
  scale: string
  highDpi: boolean
  layerTypes?: string[]
}

interface SessionResponseBody {
  session: string
  expiry: string
  tileWidth: number
  tileHeight: number
  imageFormat: string
}

const CREATE_SESSION_URL = 'https://tile.googleapis.com/v1/createSession'
const L1_TTL_MS = 10 * 60 * 1000
const REFRESH_BUFFER_S = 60 * 60

interface L1Entry {
  value: CachedSession
  loadedAt: number
}

export class GoogleTileSessionService {
  private readonly log: FastifyBaseLogger
  private readonly fastify: FastifyInstance
  private readonly apiKey: string
  private readonly l1 = new Map<string, L1Entry>()
  private readonly inFlight = new Map<string, Promise<CachedSession>>()

  constructor(baseLog: FastifyBaseLogger, fastify: FastifyInstance) {
    this.log = createServiceLogger(baseLog, 'GOOGLE-TILE-SESSION')
    this.fastify = fastify
    this.apiKey = fastify.config.googleMapsServerApiKey
  }

  async getSession(options: TileSessionQuery): Promise<CachedSession> {
    const key = hashOptions(options)
    const now = nowSeconds()

    const l1Hit = this.l1.get(key)
    if (
      l1Hit &&
      l1Hit.value.expiry - now > REFRESH_BUFFER_S &&
      Date.now() - l1Hit.loadedAt < L1_TTL_MS
    ) {
      return l1Hit.value
    }

    const pending = this.inFlight.get(key)
    if (pending) return pending

    const promise = this.loadOrRefresh(key, options, now).finally(() =>
      this.inFlight.delete(key),
    )
    this.inFlight.set(key, promise)
    return promise
  }

  private async loadOrRefresh(
    key: string,
    options: TileSessionQuery,
    now: number,
  ): Promise<CachedSession> {
    const fromDb = await this.readFromDb(key)
    if (fromDb && fromDb.expiry - now > REFRESH_BUFFER_S) {
      this.l1.set(key, { value: fromDb, loadedAt: Date.now() })
      return fromDb
    }

    const fresh = await this.callCreateSession(options)
    await this.writeToDb(key, options, fresh)
    this.l1.set(key, { value: fresh, loadedAt: Date.now() })
    return fresh
  }

  private async readFromDb(key: string): Promise<CachedSession | null> {
    try {
      const row = await this.fastify.db.getTileSession(key)
      if (!row) return null
      return {
        session: row.sessionToken,
        expiry: Math.floor(row.expiry.getTime() / 1000),
      }
    } catch (err) {
      this.log.warn({ err }, 'L2 read failed, falling through to createSession')
      return null
    }
  }

  private async writeToDb(
    key: string,
    options: TileSessionQuery,
    value: CachedSession,
  ): Promise<void> {
    try {
      await this.fastify.db.upsertTileSession(
        key,
        options,
        value.session,
        new Date(value.expiry * 1000),
      )
    } catch (err) {
      this.log.warn({ err }, 'L2 write failed, continuing with L1-only state')
    }
  }

  private async callCreateSession(
    options: TileSessionQuery,
  ): Promise<CachedSession> {
    const body: SessionRequestBody = {
      mapType: options.mapType,
      language: 'en-US',
      region: 'US',
      scale: 'scaleFactor2x',
      highDpi: true,
    }
    if (options.layerType) body.layerTypes = [options.layerType]

    const response = await fetch(
      `${CREATE_SESSION_URL}?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      },
    )

    if (!response.ok) {
      const text = await response.text().catch(() => '<no body>')
      throw new Error(
        `createSession failed: ${response.status} ${response.statusText} ${text}`,
      )
    }

    const data = (await response.json()) as SessionResponseBody
    const expiry = Number.parseInt(data.expiry, 10)
    if (Number.isNaN(expiry)) {
      throw new Error(
        `createSession returned non-numeric expiry: ${data.expiry}`,
      )
    }
    return { session: data.session, expiry }
  }
}

function hashOptions(options: TileSessionQuery): string {
  const layer = options.layerType ?? ''
  return `${options.mapType}|${layer}`
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
