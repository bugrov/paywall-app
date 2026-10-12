import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { createError } from 'h3'
import { SCHEMA_STATEMENTS } from '../db/schema'

type Sql = NeonQueryFunction<false, false>

let client: Sql | null = null
let schemaReady: Promise<void> | null = null

function connectionString(): string | undefined {
  // Integration Neon в Vercel Marketplace кладёт DATABASE_URL (и POSTGRES_URL как запасной)
  return process.env.DATABASE_URL || process.env.POSTGRES_URL
}

/** SQL-клиент Neon с гарантией, что таблица создана. */
export async function useDb(): Promise<Sql> {
  const url = connectionString()
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'База данных не настроена' })
  }

  client ??= neon(url)
  const sql = client

  schemaReady ??= (async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await sql.query(statement)
    }
  })().catch((error) => {
    schemaReady = null
    throw error
  })
  await schemaReady

  return sql
}
