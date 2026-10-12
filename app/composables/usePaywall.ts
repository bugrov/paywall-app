export const PURCHASE_ERROR = 'Не удалось оформить покупку. Проверьте интернет и нажмите «Повторить».'
const OFFERS_ERROR = 'Не удалось загрузить тарифы. Проверьте интернет и нажмите «Повторить».'
const RESTORE_EMPTY = 'Покупок на этом устройстве не найдено.'
const RESTORE_ERROR = 'Не удалось восстановить покупки. Проверьте интернет и попробуйте ещё раз.'

// Запрос, который завис без обрыва, не должен оставлять экран в спиннере навсегда
const REQUEST_TIMEOUT_MS = 15_000

type PurchaseState = 'idle' | 'purchasing' | 'error' | 'success'

function httpStatus(error: unknown): number | undefined {
  const candidate = error as { statusCode?: number, status?: number } | null
  return candidate?.statusCode ?? candidate?.status
}

export function usePaywall() {
  const deviceId = useDeviceId()
  const { data, status: fetchStatus, error: fetchError, refresh } = useFetch<Offer[]>('/api/offers', {
    default: () => [],
    timeout: REQUEST_TIMEOUT_MS
  })

  // Не доверяем форме ответа: прокси может вернуть 200 с HTML вместо JSON
  const offers = computed(() => (Array.isArray(data.value) ? data.value : []))
  // Загрузка закончилась, а тарифов нет: это сбой, а не вечная загрузка
  const offersFailed = computed(() => (
    Boolean(fetchError.value) || (fetchStatus.value === 'success' && !offers.value.length)
  ))

  const chosenId = ref<string | null>(null)
  const purchaseState = ref<PurchaseState>('idle')
  const restoring = ref(false)
  // Сообщение под карточками: ошибка покупки или результат восстановления
  const notice = ref('')
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
    if (offersFailed.value) {
      return 'error'
    }
    if (fetchStatus.value === 'pending' || !offers.value.length) {
      return 'loading'
    }
    return 'ready'
  })

  const errorMessage = computed(() => notice.value || (offersFailed.value ? OFFERS_ERROR : ''))

  function select(offerId: string) {
    if (offerId === selectedId.value) {
      return
    }
    chosenId.value = offerId
    idempotencyKey = null
    notice.value = ''
    if (purchaseState.value === 'error') {
      purchaseState.value = 'idle'
    }
  }

  async function purchase() {
    if (!selectedId.value || purchaseState.value === 'purchasing' || restoring.value) {
      return
    }
    purchaseState.value = 'purchasing'
    notice.value = ''
    idempotencyKey ??= createId()
    try {
      const result = await $fetch<PurchaseResponse>('/api/purchase', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { offerId: selectedId.value, deviceId: deviceId.value } satisfies PurchaseRequest,
        timeout: REQUEST_TIMEOUT_MS
      })
      // Успехом считаем только ответ с идентификатором записи, а не любой 2xx
      if (!result?.purchaseId) {
        throw new Error('Пустой ответ на покупку')
      }
      idempotencyKey = null
      purchaseState.value = 'success'
    } catch (error) {
      console.error('purchase failed', error)
      // 4xx: запрос неверен, повтор с тем же ключом дал бы тот же отказ
      const code = httpStatus(error)
      if (code !== undefined && code >= 400 && code < 500) {
        idempotencyKey = null
      }
      notice.value = PURCHASE_ERROR
      purchaseState.value = 'error'
    }
  }

  /** Главная кнопка: купить, а при сбое загрузки тарифов - загрузить заново */
  async function submit() {
    if (offersFailed.value && purchaseState.value === 'idle') {
      await refresh()
      return
    }
    await purchase()
  }

  /** «Восстановить покупки»: есть ли на этом устройстве записанные покупки */
  async function restore() {
    if (restoring.value || purchaseState.value === 'purchasing') {
      return
    }
    restoring.value = true
    notice.value = ''
    try {
      const purchases = await $fetch<PurchaseResponse[]>('/api/purchases', {
        query: { deviceId: deviceId.value },
        timeout: REQUEST_TIMEOUT_MS
      })
      if (!Array.isArray(purchases)) {
        throw new TypeError('Неожиданный ответ сервера')
      }
      if (purchases.length) {
        purchaseState.value = 'success'
      } else {
        notice.value = RESTORE_EMPTY
      }
    } catch (error) {
      console.error('restore failed', error)
      notice.value = RESTORE_ERROR
    } finally {
      restoring.value = false
    }
  }

  return { offers, selectedId, status, errorMessage, restoring, select, submit, restore }
}
