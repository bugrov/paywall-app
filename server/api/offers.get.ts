import { defineEventHandler } from 'h3'
import type { Offer } from '#shared/types/paywall'
import { OFFERS } from '../utils/offers'

// GET /api/offers: список тарифов для экрана paywall (каталог лежит в server/utils/offers.ts)
export default defineEventHandler((): Offer[] => OFFERS)
