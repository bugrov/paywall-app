<script setup lang="ts">
const { offers, selectedId, status, errorMessage, restoring, select, submit, restore } = usePaywall()

// Только в dev: ?preview=loading|purchasing|error|success подменяет статус экрана, чтобы увидеть
// состояние из макета без реальной покупки. Тарифы при этом грузятся как обычно.
const route = useRoute()
const previewStatus = import.meta.dev ? (route.query.preview as PaywallStatus | undefined) : undefined

const viewStatus = computed(() => previewStatus ?? status.value)
const viewError = computed(() => (previewStatus === 'error' ? PURCHASE_ERROR : errorMessage.value))

// В webview закрытие экрана отдаём окружению
function closePaywall() {
  window.close()
}
</script>

<template>
  <PaywallScreen
    :offers="offers"
    :selected-id="selectedId"
    :status="viewStatus"
    :error-message="viewError"
    :restoring="restoring"
    @select="select"
    @submit="submit"
    @restore="restore"
    @close="closePaywall"
  />
</template>
