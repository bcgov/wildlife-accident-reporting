import { createDatabase } from '@services/database/create-database.js'
import type { DB } from '@services/database/types/database.js'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import type { Kysely } from 'kysely'

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<DB>
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const { config } = fastify

    const db = createDatabase({
      url: config.databaseUrl,
      hostname: config.dbHost,
      port: config.dbPort,
      username: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      max: config.dbPoolSize,
    })

    fastify.decorate('db', db)

    fastify.addHook('onClose', async () => {
      fastify.log.info('Closing database connection...')
      await db.destroy()
    })
  },
  {
    name: 'database',
    dependencies: ['config'],
  },
)
