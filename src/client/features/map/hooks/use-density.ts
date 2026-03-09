import { useMemo } from 'react'
import { useAppQuery } from '@/hooks/use-app-query'
import { densityQueryKey, fetchDensity } from '@/lib/density-api'
import type { IncidentFilters } from '@/lib/incidents-api'
import { useFilterStore } from '@/stores/filter-store'
import { useLayerStore } from '../store/layer-store'

export function useDensity() {
  const visible = useLayerStore((s) => s.layers.density)

  const years = useFilterStore((s) => s.years)
  const species = useFilterStore((s) => s.species)
  const serviceAreas = useFilterStore((s) => s.serviceAreas)
  const sex = useFilterStore((s) => s.sex)
  const timeOfKill = useFilterStore((s) => s.timeOfKill)
  const age = useFilterStore((s) => s.age)
  const startDate = useFilterStore((s) => s.startDate)
  const endDate = useFilterStore((s) => s.endDate)
  const geometry = useFilterStore((s) => s.geometry)

  const filters: IncidentFilters = useMemo(
    () => ({
      years,
      species,
      serviceAreas,
      sex,
      timeOfKill,
      age,
      startDate,
      endDate,
      geometry,
    }),
    [
      years,
      species,
      serviceAreas,
      sex,
      timeOfKill,
      age,
      startDate,
      endDate,
      geometry,
    ],
  )

  return useAppQuery({
    queryKey: densityQueryKey(filters),
    queryFn: () => fetchDensity(filters),
    enabled: visible,
  })
}
