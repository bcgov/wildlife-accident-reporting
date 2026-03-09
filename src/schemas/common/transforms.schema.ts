import { PolygonGeometrySchema } from '@schemas/common/geojson.schema.js'
import { z } from 'zod'

// Comma-separated string to array of numbers
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

// Comma-separated string to array of strings (trimmed)
export const commaStrings = z.string().transform((s) =>
  s
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0),
)

// Parse a GeoJSON geometry string from drawing tools (Polygon or MultiPolygon)
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
