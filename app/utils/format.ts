const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
})

/** 2490 -> «2 490 ₽» */
export function formatPrice(value: number): string {
  return rubles.format(value)
}

/** Подпись под ценой: «в месяц» или «207 ₽ в месяц» */
export function formatOfferNote(offer: Offer): string {
  if (offer.period === 'month') {
    return 'в месяц'
  }
  return offer.pricePerMonth ? `${formatPrice(offer.pricePerMonth)} в месяц` : 'в год'
}
