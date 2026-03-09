import { LkiSyncService } from '@services/lki/lki-sync.js'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    lkiSync: LkiSyncService
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const syncService = new LkiSyncService(fastify.log, fastify)
    fastify.decorate('lkiSync', syncService)
  },
  {
    name: 'lki',
    dependencies: ['config', 'database'],
  },
)
