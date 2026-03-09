import { ErrorSchema } from '@schemas/common/error.schema.js'
import { LkiSyncResponseSchema } from '@schemas/incidents/lki-sync.schema.js'
import { logRouteError } from '@utils/route-errors.js'
import type { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'

const plugin: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  fastify.addHook('preParsing', async (request) => {
    if (
      request.headers['content-length'] === '0' ||
      request.headers['content-length'] === undefined
    ) {
      delete request.headers['content-type']
    }
  })

  fastify.post(
    '/lki-sync',
    {
      schema: {
        summary: 'Sync LKI highway segments from BC WFS',
        operationId: 'syncLkiSegments',
        description:
          'Fetches all LKI highway segments from the BC DataCatalogue WFS and upserts them into the local database using chris_lki_segment_id for deduplication.',
        response: {
          200: LkiSyncResponseSchema,
          500: ErrorSchema,
        },
        tags: ['Incidents'],
      },
    },
    async (request, reply) => {
      try {
        const result = await fastify.lkiSync.sync()
        if (result.upserted > 0 || result.deleted > 0) {
          fastify.responseCache.clear()
        }
        return result
      } catch (error) {
        logRouteError(fastify.log, request, error, {
          message: 'LKI sync failed',
        })
        return reply.internalServerError('LKI sync failed')
      }
    },
  )
}

export default plugin
