import type { AddProtocolAction } from 'maplibre-gl'
import { evictSession, getSession } from './google-session-cache'

const TILE_BASE = 'https://tile.googleapis.com/v1/2dtiles'

export const googleProtocol: AddProtocolAction = async (params, abort) => {
  const url = new URL(params.url.replace('google://', 'https://'))
  const mapType = url.hostname
  const layerType = url.searchParams.get('layerType') ?? undefined
  const apiKey = url.searchParams.get('key')
  if (!apiKey) {
    throw new Error('google protocol URL missing `key` parameter')
  }

  return fetchTile(mapType, layerType, apiKey, url.pathname, abort, false)
}

async function fetchTile(
  mapType: string,
  layerType: string | undefined,
  apiKey: string,
  tilePath: string,
  abort: AbortController,
  isRetry: boolean,
): Promise<{ data: ArrayBuffer }> {
  const session = await getSession(mapType, layerType)
  const tileUrl = `${TILE_BASE}${tilePath}?session=${encodeURIComponent(session)}&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(tileUrl, { signal: abort.signal })

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      evictSession(mapType, layerType)
      return fetchTile(mapType, layerType, apiKey, tilePath, abort, true)
    }
    throw new Error(
      `Google tile request failed: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.arrayBuffer()
  return { data }
}
