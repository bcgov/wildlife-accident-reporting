import { PolygonGeometrySchema } from '@schemas/common/geojson.schema.js'
import { z } from 'zod'

export const commaNumbers = z
  .string()
  .transform((s) =>
    s
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map(Number),
  )
  .pipe(z.array(z.number().int()))

export const commaStrings = z.string().transform((s) =>
  s
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0),
)

// Accepts GeoJSON string from map drawing tools
export const geoJsonString = z
  .string()
  .transform((s, ctx) => {
    try {
      return JSON.parse(s)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON' })
      return z.NEVER
    }
  })
  .pipe(PolygonGeometrySchema)
