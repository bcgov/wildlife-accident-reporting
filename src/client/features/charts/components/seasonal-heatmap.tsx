import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SeasonalHeatmapRow } from '../types/chart-types'

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

type SeasonalHeatmapProps = {
  data: SeasonalHeatmapRow[]
  isLoading: boolean
}

type TooltipState = {
  species: string
  color: string
  month: string
  count: number
  x: number
  y: number
  flipBelow: boolean
}

export function SeasonalHeatmap({ data, isLoading }: SeasonalHeatmapProps) {
  const chartHeight = 'clamp(280px, 30vh, 450px)'
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonal Patterns</CardTitle>
        <CardDescription>
          Incident counts by month, color intensity normalized per species
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full" style={{ height: chartHeight }} />
        ) : data.length === 0 ? (
          <p
            className="text-muted-foreground flex items-center justify-center text-center"
            style={{ height: chartHeight }}
          >
            No data available
          </p>
        ) : (
          <div
            className="relative overflow-x-auto"
            style={{ minHeight: chartHeight }}
          >
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns:
                  'minmax(100px, max-content) repeat(12, 1fr)',
              }}
            >
              <div />
              {MONTH_LABELS.map((label) => (
                <div
                  key={label}
                  className="text-muted-foreground px-1 pb-2 text-center text-xs font-medium"
                >
                  {label}
                </div>
              ))}

              {data.map((row) => {
                const rowMax = Math.max(...row.months)

                return (
                  <div key={row.speciesGroupName} className="contents">
                    <div className="text-muted-foreground flex items-center pr-3 text-xs leading-tight">
                      {row.speciesGroupName}
                    </div>
                    {row.months.map((count, i) => {
                      const opacity = rowMax > 0 ? count / rowMax : 0
                      return (
                        <div
                          key={MONTH_LABELS[i]}
                          role="img"
                          aria-label={`${row.speciesGroupName} ${MONTH_LABELS[i]}: ${count}`}
                          className="flex h-6 items-center justify-center rounded-sm text-xs"
                          style={{
                            backgroundColor: row.color,
                            opacity: Math.max(opacity, 0.05),
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const parent = e.currentTarget.closest('.relative')
                            if (!parent) return
                            const parentRect = parent.getBoundingClientRect()
                            const y = rect.top - parentRect.top
                            setTooltip({
                              species: row.speciesGroupName,
                              color: row.color,
                              month: MONTH_LABELS[i],
                              count,
                              x: rect.left - parentRect.left + rect.width / 2,
                              y,
                              flipBelow: y < 40,
                            })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {tooltip && (
              <div
                className="pointer-events-none absolute z-10 grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"
                style={{
                  left: tooltip.x,
                  top: tooltip.flipBelow ? tooltip.y + 24 : tooltip.y,
                  transform: tooltip.flipBelow
                    ? 'translate(-50%, 4px)'
                    : 'translate(-50%, -100%) translateY(-4px)',
                }}
              >
                <div className="font-medium">{tooltip.month}</div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: tooltip.color }}
                  />
                  <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                    <span className="text-muted-foreground">
                      {tooltip.species}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {tooltip.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
