import { createError, defineEventHandler, getHeader, isError, readBody } from 'h3'
import type { PurchaseRequest, PurchaseResponse } from '#shared/types/paywall'
import { useDb } from '../utils/db'
import { findOffer } from '../utils/offers'

// Допустимый вид deviceId и Idempotency-Key: UUID и подобные токены
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/
// Тело запроса - два коротких поля; всё, что больше, не читаем
const MAX_BODY_BYTES = 1024

interface PurchaseRow {
  id: string
  offer_id: string
  device_id: string
  created_at: string | Date
}

function toResponse(row: PurchaseRow): PurchaseResponse {
  return {
    purchaseId: row.id,
    offerId: row.offer_id,
    createdAt: new Date(row.created_at).toISOString()
  }
}

// POST /api/purchase: тестовая покупка, пишет строку в purchases. Реальных платежей нет.
// Повторный запрос с тем же Idempotency-Key не создаёт вторую запись, а возвращает первую.
export default defineEventHandler(async (event): Promise<PurchaseResponse> => {
  const contentLength = Number(getHeader(event, 'content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large', message: 'Слишком большой запрос' })
  }

  const body = await readBody<Partial<PurchaseRequest> | null>(event)
  const idempotencyKey = getHeader(event, 'idempotency-key')

  if (!body || typeof body.offerId !== 'string' || typeof body.deviceId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Нужны offerId и deviceId' })
  }
  if (!SAFE_ID_PATTERN.test(body.deviceId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Некорректный deviceId' })
  }
  if (!idempotencyKey || !SAFE_ID_PATTERN.test(idempotencyKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Нужен заголовок Idempotency-Key' })
  }
  if (!findOffer(body.offerId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Неизвестный тариф' })
  }

  const { offerId, deviceId } = body

  try {
    const sql = await useDb()

    const inserted = await sql.query(
      `insert into purchases (offer_id, device_id, idempotency_key)
       values ($1, $2, $3)
       on conflict (idempotency_key) do nothing
       returning id, offer_id, device_id, created_at`,
      [offerId, deviceId, idempotencyKey]
    ) as PurchaseRow[]

    if (inserted[0]) {
      return toResponse(inserted[0])
    }

    // Ключ уже использован: отдаём исходную покупку, если запрос тот же
    const existing = await sql.query(
      'select id, offer_id, device_id, created_at from purchases where idempotency_key = $1',
      [idempotencyKey]
    ) as PurchaseRow[]
    const row = existing[0]
    if (!row || row.offer_id !== offerId || row.device_id !== deviceId) {
      throw createError({ statusCode: 409, statusMessage: 'Conflict', message: 'Idempotency-Key уже использован для другой покупки' })
    }
    return toResponse(row)
  } catch (error) {
    if (isError(error)) {
      throw error
    }
    console.error('purchase failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Не удалось сохранить покупку' })
  }
})
