import type { Offer } from '#shared/types/paywall'

// Каталог тарифов. Единственный источник правды: его читают и GET /api/offers,
// и POST /api/purchase (проверка offerId).
export const OFFERS: Offer[] = [
  { id: 'month', title: 'Месяц', price: 399, period: 'month' },
  { id: 'year', title: 'Год', price: 2490, period: 'year', pricePerMonth: 207, badge: 'Выгода −48%' }
]

export function findOffer(id: string): Offer | undefined {
  return OFFERS.find(offer => offer.id === id)
}
