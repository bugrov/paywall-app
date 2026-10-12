export const PURCHASE_ERROR = 'Не удалось оформить покупку. Проверьте интернет и нажмите «Повторить».'
const OFFERS_ERROR = 'Не удалось загрузить тарифы. Проверьте интернет и нажмите «Повторить».'

type PurchaseState = 'idle' | 'purchasing' | 'error' | 'success'

export function usePaywall() {
  const deviceId = useDeviceId()
  const { data, status: fetchStatus, error: fetchError, refresh } = useFetch<Offer[]>('/api/offers', {
    default: () => []
  })

  const offers = computed(() => data.value ?? [])
  const chosenId = ref<string | null>(null)
  const purchaseState = ref<PurchaseState>('idle')
  // Один ключ на попытку: повтор после обрыва не создаёт вторую покупку
  let idempotencyKey: string | null = null

  // Выбор по умолчанию: тариф с плашкой, иначе последний. computed, а не watch:
  // в SSR эффекты не перезапускаются, и серверный HTML остался бы без выбора.
  const selectedId = computed(() => {
    if (chosenId.value) {
      return chosenId.value
    }
    const preferred = offers.value.find(offer => offer.badge) ?? offers.value[offers.value.length - 1]
    return preferred?.id ?? null
  })

  const status = computed<PaywallStatus>(() => {
    if (purchaseState.value !== 'idle') {
      return purchaseState.value
    }
    if (fetchError.value) {
      return 'error'
    }
    if (fetchStatus.value === 'pending' || !offers.value.length) {
      return 'loading'
    }
    return 'ready'
  })

  const errorMessage = computed(() => {
    if (purchaseState.value === 'error') {
      return PURCHASE_ERROR
    }
    return fetchError.value ? OFFERS_ERROR : ''
  })

  function select(offerId: string) {
    if (offerId === selectedId.value) {
      return
    }
    chosenId.value = offerId
    idempotencyKey = null
    if (purchaseState.value === 'error') {
      purchaseState.value = 'idle'
    }
  }

  async function purchase() {
    if (!selectedId.value || purchaseState.value === 'purchasing') {
      return
    }
    purchaseState.value = 'purchasing'
    idempotencyKey ??= createId()
    try {
      await $fetch<PurchaseResponse>('/api/purchase', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { offerId: selectedId.value, deviceId: deviceId.value } satisfies PurchaseRequest
      })
      idempotencyKey = null
      purchaseState.value = 'success'
    } catch {
      purchaseState.value = 'error'
    }
  }

  /** Главная кнопка: купить, а при ошибке загрузки тарифов - загрузить заново */
  async function submit() {
    if (fetchError.value && purchaseState.value === 'idle') {
      await refresh()
      return
    }
    await purchase()
  }

  return { offers, selectedId, status, errorMessage, select, submit }
}
