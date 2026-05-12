import { GoogleTileSessionService } from '@services/maps/google-tile-session.js'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    googleTileSession: GoogleTileSessionService
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const service = new GoogleTileSessionService(fastify.log, fastify)
    fastify.decorate('googleTileSession', service)
  },
  {
    name: 'maps',
    dependencies: ['config', 'database'],
  },
)
