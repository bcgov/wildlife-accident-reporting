import { TriangleAlertIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { MAX_YEARS_FOR_MONTHLY } from '../lib/aggregations'
import type { TimeBucketRow } from '../types/chart-types'

type SpeciesBarChartProps = {
  data: TimeBucketRow[]
  speciesKeys: string[]
  config: ChartConfig
  isLoading: boolean
  monthlyUnavailable: boolean
}

export function SpeciesBarChart({
  data,
  speciesKeys,
  config,
  isLoading,
  monthlyUnavailable,
}: SpeciesBarChartProps) {
  const chartHeight = 'clamp(280px, 30vh, 450px)'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents by Species</CardTitle>
        <CardDescription>
          Top 9 species shown per bar, smaller counts grouped as Remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full" style={{ height: chartHeight }} />
        ) : monthlyUnavailable ? (
          <div
            className="flex items-center justify-center"
            style={{ height: chartHeight }}
          >
            <Alert variant="warning" className="max-w-sm">
              <TriangleAlertIcon />
              <AlertTitle>Monthly view unavailable</AlertTitle>
              <AlertDescription>
                Select {MAX_YEARS_FOR_MONTHLY} or fewer years to use the monthly
                view
              </AlertDescription>
            </Alert>
          </div>
        ) : data.length === 0 ? (
          <p
            className="text-muted-foreground flex items-center justify-center text-center"
            style={{ height: chartHeight }}
          >
            No data available
          </p>
        ) : (
          <ChartContainer
            config={config}
            className="w-full"
            style={{ height: chartHeight }}
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={50}
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {speciesKeys.map((species) => (
                <Bar
                  key={species}
                  dataKey={species}
                  stackId="species"
                  fill={config[species]?.color}
                  maxBarSize={80}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
