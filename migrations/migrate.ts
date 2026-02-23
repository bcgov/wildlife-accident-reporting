import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { FileMigrationProvider, Migrator } from 'kysely'
import { createDatabase } from '../src/services/database/create-database.js'

const db = createDatabase()

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.resolve(import.meta.dir, 'migrations'),
  }),
})

async function migrate() {
  const { error, results } = await migrator.migrateToLatest()

  for (const result of results ?? []) {
    if (result.status === 'Success') {
      console.log(`Migration "${result.migrationName}" applied successfully`)
    } else if (result.status === 'Error') {
      console.error(`Migration "${result.migrationName}" failed`)
    }
  }

  if (error) {
    console.error('Migration failed:', error)
    await db.destroy()
    process.exit(1)
  }

  console.log('Migrations completed successfully')
  await db.destroy()
}

migrate()
