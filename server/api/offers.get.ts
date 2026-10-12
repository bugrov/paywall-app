import { defineEventHandler, setResponseHeader } from 'h3'
import type { Offer } from '#shared/types/paywall'
import { OFFERS } from '../utils/offers'

// GET /api/offers: список тарифов для экрана paywall (каталог лежит в server/utils/offers.ts).
// Каталог меняется только деплоем, поэтому ответ можно держать в кэше несколько минут.
export default defineEventHandler((event): Offer[] => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  return OFFERS
})
