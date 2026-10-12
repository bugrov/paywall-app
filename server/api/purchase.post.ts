import { randomUUID } from 'node:crypto'

// ЗАГЛУШКА этапа 3: проверяет вход и отвечает успехом, в БД ничего не пишет.
// Запись в Neon и идемпотентность по Idempotency-Key появятся на этапе 4.
export default defineEventHandler(async (event): Promise<PurchaseResponse> => {
  const body = await readBody<Partial<PurchaseRequest> | null>(event)

  if (!body || typeof body.offerId !== 'string' || typeof body.deviceId !== 'string' || !body.deviceId) {
    throw createError({ statusCode: 400, statusMessage: 'Нужны offerId и deviceId' })
  }
  if (!findOffer(body.offerId)) {
    throw createError({ statusCode: 400, statusMessage: 'Неизвестный тариф' })
  }

  return {
    purchaseId: randomUUID(),
    offerId: body.offerId,
    createdAt: new Date().toISOString()
  }
})
