import {
  AgeEnum,
  SexEnum,
  TimeOfKillEnum,
} from '@schemas/common/enums.schema.js'
import {
  commaNumbers,
  commaStrings,
  geoJsonString,
} from '@schemas/common/transforms.schema.js'
import { z } from 'zod'

export const DensityQuerySchema = z
  .object({
    year: commaNumbers.optional().meta({
      override: {
        type: 'string',
        description: 'Comma-separated list of years (e.g. 2020,2021)',
        example: '2020,2021',
      },
    }),
    species: commaNumbers.optional().meta({
      override: {
        type: 'string',
        description:
          'Comma-separated species IDs from GET /v1/incidents/filters',
        example: '10,18',
      },
    }),
    serviceArea: commaNumbers.optional().meta({
      override: {
        type: 'string',
        description:
          'Comma-separated service area IDs from GET /v1/incidents/filters',
        example: '16,17',
      },
    }),
    sex: commaStrings
      .pipe(z.array(SexEnum))
      .optional()
      .meta({
        override: {
          type: 'string',
          description: 'Comma-separated values: MALE, FEMALE, UNKNOWN',
          example: 'MALE,FEMALE,UNKNOWN',
        },
      }),
    timeOfKill: commaStrings
      .pipe(z.array(TimeOfKillEnum))
      .optional()
      .meta({
        override: {
          type: 'string',
          description: 'Comma-separated values: DAY, DAWN, DUSK, DARK, UNKNOWN',
          example: 'DAY,DAWN,DUSK,DARK,UNKNOWN',
        },
      }),
    age: commaStrings
      .pipe(z.array(AgeEnum))
      .optional()
      .meta({
        override: {
          type: 'string',
          description: 'Comma-separated values: ADULT, YOUNG, UNKNOWN',
          example: 'ADULT,YOUNG,UNKNOWN',
        },
      }),
    startDate: z.iso.date().optional().meta({
      description: 'Start date filter (inclusive, YYYY-MM-DD)',
      example: '2021-01-01',
    }),
    endDate: z.iso.date().optional().meta({
      description: 'End date filter (inclusive, YYYY-MM-DD)',
      example: '2021-12-31',
    }),
    geometry: geoJsonString.optional().meta({
      override: {
        type: 'string',
        description:
          'GeoJSON geometry string for spatial filtering (e.g. Polygon)',
        example:
          '{"type":"Polygon","coordinates":[[[-123.2,49.2],[-123.0,49.2],[-123.0,49.3],[-123.2,49.3],[-123.2,49.2]]]}',
      },
    }),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.startDate <= data.endDate,
    { message: 'startDate must be before or equal to endDate' },
  )

export type DensityQuery = z.infer<typeof DensityQuerySchema>

export const DensitySegmentSchema = z.object({
  segmentId: z.number().int(),
  segmentName: z.string(),
  segmentDescription: z.string().nullable(),
  highwayNumber: z.string().nullable(),
  segmentLengthKm: z.number().nullable(),
  geometry: z.record(z.string(), z.unknown()),
  small: z.number().int(),
  medium: z.number().int(),
  large: z.number().int(),
  totalAnimals: z.number().int(),
  weighted: z.number(),
  densityPerKm: z.number().nullable(),
})

export const DensityResponseSchema = z.array(DensitySegmentSchema)

export type DensityResponse = z.infer<typeof DensityResponseSchema>
