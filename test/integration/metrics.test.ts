import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build } from '../helpers/app.js'

describe('Metrics', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await build()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /metrics returns Prometheus exposition for in-cluster callers', async () => {
    const res = await app.inject({ method: 'GET', url: '/metrics' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/plain')
    expect(res.body).toContain('process_cpu_user_seconds_total')
  })

  it('GET /metrics returns 404 when x-forwarded-host is present', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/metrics',
      headers: { 'x-forwarded-host': 'example.com' },
    })
    expect(res.statusCode).toBe(404)
  })
})
