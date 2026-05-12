import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable('google_tile_sessions')
    .addColumn('options_hash', 'text', (col) => col.primaryKey())
    .addColumn('options', 'jsonb', (col) => col.notNull())
    .addColumn('session_token', 'text', (col) => col.notNull())
    .addColumn('expiry', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute()
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable('google_tile_sessions').execute()
}
