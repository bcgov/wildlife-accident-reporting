import {
  type TileSessionResponse,
  TileSessionResponseSchema,
} from '@schemas/maps/session.schema'
import { apiClient } from '@/lib/apiClient'

const STORAGE_PREFIX = 'wisr:gmt:'
const REFRESH_BUFFER_S = 10 * 60

const memory = new Map<string, TileSessionResponse>()

export async function getSession(
  mapType: string,
  layerType: string | undefined,
): Promise<string> {
  const key = cacheKey(mapType, layerType)
  const now = nowSeconds()

  let cached = memory.get(key) ?? readFromStorage(key)
  if (cached && cached.expiry - now > REFRESH_BUFFER_S) {
    memory.set(key, cached)
    return cached.session
  }

  cached = await fetchFromBackend(mapType, layerType)
  memory.set(key, cached)
  writeToStorage(key, cached)
  return cached.session
}

export function evictSession(
  mapType: string,
  layerType: string | undefined,
): void {
  const key = cacheKey(mapType, layerType)
  memory.delete(key)
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // localStorage may throw (private mode, quota); in-memory state is authoritative
  }
}

async function fetchFromBackend(
  mapType: string,
  layerType: string | undefined,
): Promise<TileSessionResponse> {
  const params = new URLSearchParams({ mapType })
  if (layerType) params.set('layerType', layerType)
  return apiClient.get(
    `/v1/maps/session?${params.toString()}`,
    TileSessionResponseSchema,
  )
}

function cacheKey(mapType: string, layerType: string | undefined): string {
  return `${mapType}|${layerType ?? ''}`
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function readFromStorage(key: string): TileSessionResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    const result = TileSessionResponseSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

function writeToStorage(key: string, session: TileSessionResponse): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(session))
  } catch {
    // localStorage may throw (private mode, quota); in-memory state is authoritative
  }
}
