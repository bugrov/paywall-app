/** Тариф, как его отдаёт GET /api/offers */
export interface Offer {
  id: string
  /** Название на карточке: «Месяц», «Год» */
  title: string
  /** Цена за период в рублях */
  price: number
  period: 'month' | 'year'
  /** Эквивалент в месяц для длинных тарифов */
  pricePerMonth?: number
  /** Плашка над карточкой: «Выгода −48%» */
  badge?: string
}

/** Тело POST /api/purchase */
export interface PurchaseRequest {
  offerId: string
  deviceId: string
}

/** Покупка: ответ POST /api/purchase и элемент ответа GET /api/purchases */
export interface PurchaseResponse {
  purchaseId: string
  offerId: string
  createdAt: string
}

/** Состояние экрана paywall (совпадает с кадрами в Figma) */
export type PaywallStatus = 'loading' | 'ready' | 'purchasing' | 'error' | 'success'
