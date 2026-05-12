import { z } from 'zod'

export const MapTypeEnum = z.enum(['roadmap', 'satellite', 'terrain'])

export const LayerTypeEnum = z.enum([
  'layerRoadmap',
  'layerStreetview',
  'layerTraffic',
])

export const TileSessionQuerySchema = z.object({
  mapType: MapTypeEnum.meta({
    description: 'Google Map Tiles API mapType (roadmap, satellite, terrain)',
    example: 'roadmap',
  }),
  layerType: LayerTypeEnum.optional().meta({
    description: 'Optional Google Map Tiles API layer overlay',
    example: 'layerTraffic',
  }),
})

export type TileSessionQuery = z.infer<typeof TileSessionQuerySchema>

export const TileSessionResponseSchema = z
  .object({
    session: z.string().min(1),
    expiry: z.number().int().positive(),
  })
  .meta({
    id: 'GoogleTileSession',
    description:
      'Reusable Google Map Tiles API session token and unix-seconds expiry',
  })

export type TileSessionResponse = z.infer<typeof TileSessionResponseSchema>
