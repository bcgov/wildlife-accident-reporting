import { ErrorSchema } from '@schemas/common/error.schema.js'
import {
  TileSessionQuerySchema,
  TileSessionResponseSchema,
} from '@schemas/maps/session.schema.js'
import { logRouteError } from '@utils/route-errors.js'
import type { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'

const plugin: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  fastify.get(
    '/session',
    {
      schema: {
        summary: 'Get a Google Map Tiles API session token',
        operationId: 'getGoogleTileSession',
        description:
          'Returns a session token usable against tile.googleapis.com 2D tile endpoints. Shared across all clients and persisted server-side for ~2 weeks so browser HTTP caching of tile responses survives reloads.',
        querystring: TileSessionQuerySchema,
        response: {
          200: TileSessionResponseSchema,
          500: ErrorSchema,
        },
        tags: ['Maps'],
      },
    },
    async (request, reply) => {
      try {
        return await fastify.googleTileSession.getSession(request.query)
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'Failed to obtain Google tile session',
        })
        return reply.internalServerError('Failed to obtain Google tile session')
      }
    },
  )
}

export default plugin
