import type { Incident } from '@schemas/incidents/incidents.schema'
import { useMemo, useState } from 'react'
import { useIncidents } from '@/hooks/use-incidents'
import { ChartToolbar } from './components/chart-toolbar'
import { KpiCards } from './components/kpi-cards'
import { SpeciesBarChart } from './components/species-bar-chart'
import {
  buildChartConfig,
  countByTimeBucket,
  MAX_YEARS_FOR_MONTHLY,
  summarize,
} from './lib/aggregations'
import type { TimeBucket } from './types/chart-types'

const EMPTY_BUCKET = { rows: [], speciesKeys: [] }
const EMPTY_INCIDENTS: Incident[] = []

export function Component() {
  const { data: response, isLoading } = useIncidents()
  const incidents = response?.data ?? EMPTY_INCIDENTS
  const hasData = incidents.length > 0
  const [bucket, setBucket] = useState<TimeBucket>('year')

  const summary = useMemo(() => summarize(incidents), [incidents])

  const byYear = useMemo(
    () => countByTimeBucket(incidents, 'year'),
    [incidents],
  )

  const yearCount = byYear.rows.length
  const monthlyAllowed = yearCount <= MAX_YEARS_FOR_MONTHLY

  const byMonth = useMemo(
    () =>
      monthlyAllowed ? countByTimeBucket(incidents, 'month') : EMPTY_BUCKET,
    [incidents, monthlyAllowed],
  )

  const dataByBucket = useMemo(
    () => ({ year: byYear, month: byMonth }),
    [byYear, byMonth],
  )

  const { rows, speciesKeys } = dataByBucket[bucket]

  const allSpeciesKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const bucketData of Object.values(dataByBucket)) {
      for (const k of bucketData.speciesKeys) keys.add(k)
    }
    return [...keys]
  }, [dataByBucket])

  const chartConfig = useMemo(
    () => buildChartConfig(incidents, allSpeciesKeys),
    [incidents, allSpeciesKeys],
  )

  const monthlyUnavailable = bucket === 'month' && !monthlyAllowed

  if (!hasData && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Select filters to view charts</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <KpiCards summary={summary} isLoading={isLoading} />
      <ChartToolbar
        bucket={bucket}
        onBucketChange={setBucket}
        speciesKeys={speciesKeys}
        config={chartConfig}
      />
      <SpeciesBarChart
        data={rows}
        speciesKeys={speciesKeys}
        config={chartConfig}
        isLoading={isLoading}
        monthlyUnavailable={monthlyUnavailable}
      />
    </div>
  )
}
