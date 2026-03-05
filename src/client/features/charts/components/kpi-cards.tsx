import { Activity, Crown, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSpeciesIcon } from '@/lib/species-icons'
import type { KpiSummary } from '../types/chart-types'

type KpiCardsProps = {
  summary: KpiSummary
  isLoading: boolean
}

export function KpiCards({ summary, isLoading }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card size="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Incidents</CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {summary.totalCount.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Species</CardTitle>
            <Crown className="text-muted-foreground size-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : summary.topSpecies ? (
            <div className="flex items-center gap-3">
              <img
                src={getSpeciesIcon(summary.topSpecies.name)}
                alt={summary.topSpecies.name}
                className="size-10"
              />
              <div>
                <p className="text-3xl font-bold tracking-tight">
                  {summary.topSpecies.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {summary.topSpecies.count.toLocaleString()} (
                  {summary.topSpecies.percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No data</p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unique Species</CardTitle>
            <Layers className="text-muted-foreground size-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {summary.uniqueSpecies.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
