<script setup lang="ts">
const { offers, selectedId, status, errorMessage, select, submit } = usePaywall()

// Только в dev: ?preview=loading|purchasing|error|success показывает состояние из макета без API
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
    @select="select"
    @submit="submit"
    @close="closePaywall"
  />
</template>
