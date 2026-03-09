import type { LkiSyncResponse } from '@schemas/incidents/lki-sync.schema.js'
import type { LkiUpsertRow } from '@services/database/types/lki.js'
import { createServiceLogger } from '@utils/logger.js'
import type { FastifyBaseLogger, FastifyInstance } from 'fastify'

const WFS_URL =
  'https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=pub:WHSE_IMAGERY_AND_BASE_MAPS.MOT_LANDMARK_KM_INVENTORY_SP&outputFormat=application/json&srsName=EPSG:4326'

interface LkiFeatureProperties {
  CHRIS_LKI_SEGMENT_ID: number
  LKI_SEGMENT_NAME: string
  LKI_SEGMENT_DESCRIPTION: string | null
  LKI_SEGMENT_DIRECTION: string | null
  LKI_SEGMENT_LENGTH: number | null
  LKI_ROUTE_ID: string | null
  HIGHWAY_NUMBER: string | null
  FEATURE_LENGTH_M: number | null
  OBJECTID: number | null
}

interface LkiGeoJsonResponse {
  type: string
  features: Array<{
    type: string
    geometry: {
      type: string
      coordinates: number[][]
    }
    properties: LkiFeatureProperties
  }>
}

export class LkiSyncService {
  private readonly log: FastifyBaseLogger
  private readonly fastify: FastifyInstance

  constructor(baseLog: FastifyBaseLogger, fastify: FastifyInstance) {
    this.log = createServiceLogger(baseLog, 'LKI-SYNC')
    this.fastify = fastify
  }

  async sync(): Promise<LkiSyncResponse> {
    const start = Date.now()

    const features = await this.fetchLkiFeatures()

    const rows: LkiUpsertRow[] = features.map((f) => ({
      chris_lki_segment_id: f.properties.CHRIS_LKI_SEGMENT_ID,
      lki_segment_name: f.properties.LKI_SEGMENT_NAME,
      lki_segment_description: f.properties.LKI_SEGMENT_DESCRIPTION ?? null,
      lki_segment_direction: f.properties.LKI_SEGMENT_DIRECTION ?? null,
      lki_segment_length: f.properties.LKI_SEGMENT_LENGTH ?? null,
      lki_route_id: f.properties.LKI_ROUTE_ID ?? null,
      highway_number: f.properties.HIGHWAY_NUMBER ?? null,
      geom: JSON.stringify(f.geometry),
      feature_length_m: f.properties.FEATURE_LENGTH_M ?? null,
      objectid: f.properties.OBJECTID ?? null,
    }))

    this.log.info(
      { totalFeatures: features.length },
      'transformed LKI features',
    )

    const { upserted, deleted } = await this.fastify.db.upsertLkiSegments(rows)
    const durationMs = Date.now() - start

    this.log.info(
      { upserted, deleted, totalFetched: features.length, durationMs },
      'LKI sync complete',
    )

    return {
      totalFetched: features.length,
      upserted,
      deleted,
      durationMs,
    }
  }

  private async fetchLkiFeatures(): Promise<LkiGeoJsonResponse['features']> {
    this.log.info('fetching LKI segments from WFS')

    const response = await fetch(WFS_URL, {
      signal: AbortSignal.timeout(60_000),
    })

    if (!response.ok) {
      const text = await response.text()
      const body = text.length > 1000 ? `${text.slice(0, 1000)}...` : text
      throw new Error(`LKI WFS request failed (${response.status}): ${body}`)
    }

    const data = (await response.json()) as LkiGeoJsonResponse
    if (!Array.isArray(data.features)) {
      throw new Error(
        'LKI WFS returned invalid response: missing features array',
      )
    }

    this.log.info({ count: data.features.length }, 'fetched LKI segments')
    return data.features
  }
}
