import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import fastifyMetricsModule = require('fastify-metrics')

const fastifyMetrics = fastifyMetricsModule.default

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(fastifyMetrics, {
      endpoint: null,
    })
  },
  {
    dependencies: ['config'],
  },
)
