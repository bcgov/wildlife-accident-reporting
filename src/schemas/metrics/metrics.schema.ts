import { z } from 'zod'

export const MetricsResponseSchema = z
  .string()
  .describe(
    'Prometheus exposition format. See https://prometheus.io/docs/instrumenting/exposition_formats/',
  )

export type MetricsResponse = z.infer<typeof MetricsResponseSchema>
