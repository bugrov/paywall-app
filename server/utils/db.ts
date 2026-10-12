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
    // Подробность только в лог: клиенту не нужно знать, как устроена конфигурация
    console.error('DATABASE_URL is not set')
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Сервис временно недоступен' })
  }

  client ??= neon(url)
  const sql = client

  // Схема создаётся один раз на инстанс одним запросом (транзакция), параллельные вызовы делят промис
  schemaReady ??= sql
    .transaction(SCHEMA_STATEMENTS.map(statement => sql.query(statement)))
    .then(() => undefined)
    .catch((error: unknown) => {
      schemaReady = null
      console.error('schema init failed', error)
      throw error
    })
  await schemaReady

  return sql
}
