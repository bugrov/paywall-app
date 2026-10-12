<script setup lang="ts">
import spinnerIcon from '~/assets/img/spinner.svg'

defineProps<{
  label: string
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  press: []
}>()
</script>

<template>
  <button
    class="cta"
    :class="{ 'cta--disabled': disabled && !loading }"
    type="button"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="emit('press')"
  >
    <img
      v-if="loading"
      class="cta__spinner"
      :src="spinnerIcon"
      alt=""
      width="22"
      height="22"
    >
    <span class="cta__label">{{ label }}</span>
  </button>
</template>

<style scoped lang="scss">
.cta {
  @include reset-button;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: toRem(10);
  width: 100%;
  height: toRem(56);
  border-radius: toRem(18);
  background-color: var(--color-comet);
  color: var(--color-night);
  line-height: 1.3;
  font-family: var(--font-body);
  font-size: toRem(18);
  font-weight: 700;

  @include focus-ring(var(--color-mint));

  &--disabled {
    background-color: var(--color-paper-12);
    color: var(--color-paper-50);
    cursor: not-allowed;
  }

  &__spinner {
    width: toRem(22);
    height: toRem(22);
    animation: cta-spin 0.9s linear infinite;
  }
}

@keyframes cta-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta__spinner {
    animation: none;
  }
}
</style>
