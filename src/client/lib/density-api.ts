import type { Geometry } from 'geojson'
import { apiClient } from '@/lib/apiClient'
import { buildQueryString, type IncidentFilters } from '@/lib/incidents-api'

export type DensitySegment = {
  segmentId: number
  segmentName: string
  segmentDescription: string | null
  highwayNumber: string | null
  segmentLengthKm: number | null
  geometry: Geometry
  small: number
  medium: number
  large: number
  totalAnimals: number
  weighted: number
  densityPerKm: number | null
}

export const densityQueryKey = (filters: IncidentFilters) =>
  ['density', filters] as const

export function fetchDensity(
  filters: IncidentFilters,
): Promise<DensitySegment[]> {
  return apiClient.get<DensitySegment[]>(
    `/v1/incidents/density${buildQueryString(filters)}`,
  )
}
