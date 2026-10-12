import { createError, defineEventHandler, getQuery } from 'h3'
import type { PurchaseResponse } from '#shared/types/paywall'
import { useDb } from '../utils/db'

// Покупки одного устройства: нужны для «Восстановить покупки». Свежие первыми.
const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/

interface PurchaseRow {
  id: string
  offer_id: string
  created_at: string | Date
}

export default defineEventHandler(async (event): Promise<PurchaseResponse[]> => {
  const { deviceId } = getQuery(event)

  if (typeof deviceId !== 'string' || !DEVICE_ID_PATTERN.test(deviceId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Нужен корректный deviceId' })
  }

  const sql = await useDb()
  try {
    const rows = await sql.query(
      `select id, offer_id, created_at from purchases
       where device_id = $1
       order by created_at desc
       limit 20`,
      [deviceId]
    ) as PurchaseRow[]

    return rows.map(row => ({
      purchaseId: row.id,
      offerId: row.offer_id,
      createdAt: new Date(row.created_at).toISOString()
    }))
  } catch (error) {
    console.error('purchases lookup failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Не удалось получить покупки' })
  }
})
