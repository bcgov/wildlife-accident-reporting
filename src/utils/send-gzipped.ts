import type { FastifyReply } from 'fastify'

export function sendGzipped(reply: FastifyReply, buffer: Buffer): FastifyReply {
  return reply
    .header('content-encoding', 'gzip')
    .header('vary', 'Accept-Encoding')
    .type('application/json')
    .send(buffer)
}
