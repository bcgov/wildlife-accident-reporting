import {
  IncidentErrorSchema,
  IncidentsQuerySchema,
  IncidentsResponseSchema,
} from '@schemas/incidents/incidents.schema.js'
import { logRouteError } from '@utils/route-errors.js'
import type { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'

const plugin: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        summary: 'Query wildlife-vehicle incidents',
        operationId: 'getIncidents',
        description:
          'Returns wildlife-vehicle collision incidents with optional filtering by species, service area, date range, spatial geometry, and more.',
        querystring: IncidentsQuerySchema,
        response: {
          200: IncidentsResponseSchema,
          500: IncidentErrorSchema,
        },
        tags: ['Incidents'],
      },
    },
    async (request, reply) => {
      try {
        const result = await fastify.db.findIncidents(request.query)
        return {
          data: result.data,
          total: result.total,
          limit: request.query.limit,
          offset: request.query.offset,
        }
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'Failed to query incidents',
        })
        return reply.internalServerError('Failed to query incidents')
      }
    },
  )
}

export default plugin
