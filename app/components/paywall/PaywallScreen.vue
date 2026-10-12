<script setup lang="ts">
import artIcon from '~/assets/img/art.svg'
import artSuccessIcon from '~/assets/img/art-success.svg'
import closeIcon from '~/assets/img/close.svg'

const props = defineProps<{
  offers: Offer[]
  selectedId: string | null
  status: PaywallStatus
  errorMessage: string
}>()

const emit = defineEmits<{
  select: [offerId: string]
  submit: []
  restore: []
  close: []
}>()

const isSuccess = computed(() => props.status === 'success')
const isPurchasing = computed(() => props.status === 'purchasing')
const isLoading = computed(() => props.status === 'loading')
// Скелетоны: пока грузим тарифы или если тарифы не пришли совсем
const showSkeleton = computed(() => isLoading.value || !props.offers.length)
const showNotice = computed(() => props.status === 'error' && Boolean(props.errorMessage))

const title = computed(() => (isSuccess.value ? 'Вся галактика открыта!' : 'Открой всю галактику'))

const ctaLabel = computed(() => {
  switch (props.status) {
    case 'purchasing':
      return 'Оформляем…'
    case 'error':
      return 'Повторить'
    case 'success':
      return 'Играть'
    default:
      return 'Открыть всё'
  }
})

function onSubmit() {
  if (isSuccess.value) {
    emit('close')
    return
  }
  emit('submit')
}
</script>

<template>
  <main
    class="paywall"
    :aria-busy="isLoading || isPurchasing"
  >
    <div class="paywall__bar">
      <button
        class="paywall__close"
        type="button"
        aria-label="Закрыть"
        @click="emit('close')"
      >
        <img
          :src="closeIcon"
          alt=""
          width="44"
          height="44"
        >
      </button>
    </div>

    <img
      class="paywall__art"
      :src="isSuccess ? artSuccessIcon : artIcon"
      alt=""
      width="320"
      height="228.571"
    >

    <h1 class="paywall__title">
      {{ title }}
    </h1>
    <p
      v-if="isSuccess"
      class="paywall__lead"
    >
      Спасибо! Все 60 уровней уже доступны.
    </p>
    <p
      v-else
      class="paywall__lead"
    >
      60 уровней, новые планеты<br>и ни одной рекламы
    </p>

    <div
      class="paywall__actions"
      :class="{ 'paywall__actions--done': isSuccess }"
    >
      <template v-if="!isSuccess">
        <div
          class="paywall__offers"
          role="radiogroup"
          aria-label="Тариф"
        >
          <template v-if="showSkeleton">
            <PaywallOfferCardSkeleton />
            <PaywallOfferCardSkeleton />
          </template>
          <PaywallOfferCard
            v-for="offer in offers"
            v-else
            :key="offer.id"
            :offer="offer"
            :selected="offer.id === selectedId"
            :dimmed="isPurchasing"
            :disabled="isPurchasing"
            @select="emit('select', $event)"
          />
        </div>

        <p
          v-if="showNotice"
          class="paywall__notice"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </template>

      <PaywallPurchaseButton
        class="paywall__cta"
        :label="ctaLabel"
        :loading="isPurchasing"
        :disabled="isLoading"
        @press="onSubmit"
      />

      <button
        v-if="!isSuccess"
        class="paywall__restore"
        :class="{ 'paywall__restore--dimmed': isLoading || isPurchasing }"
        type="button"
        :disabled="isLoading || isPurchasing"
        @click="emit('restore')"
      >
        Восстановить покупки
      </button>
    </div>
  </main>
</template>

<style scoped lang="scss">
.paywall {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: max(toRem(16), env(safe-area-inset-top)) toRem(20) max(toRem(34), env(safe-area-inset-bottom));
  width: 100%;
  max-width: toRem(430);
  min-height: 100dvh;
  margin-inline: auto;

  &__bar {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  &__close {
    @include reset-button;
    @include focus-ring(var(--color-mint));

    display: flex;
    width: toRem(44);
    height: toRem(44);
    border-radius: 50%;
  }

  &__art {
    display: block;
    width: toRem(320);
    max-width: 100%;
    height: auto;
    aspect-ratio: 320 / 228.571;
  }

  &__title {
    margin: 0;
    width: 100%;
    color: var(--color-paper);
    text-align: center;
    line-height: 1.2;
    font-family: var(--font-display);
    font-size: toRem(24);
    font-weight: 700;
  }

  &__lead {
    margin: toRem(10) 0 0;
    width: 100%;
    color: var(--color-paper-85);
    text-align: center;
    line-height: 1.45;
    font-size: toRem(16);
    font-weight: 400;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    margin-top: auto;
    padding-top: toRem(16);
    width: 100%;

    &--done {
      padding-bottom: toRem(8);
    }
  }

  &__offers {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: toRem(12);
  }

  &__notice {
    margin: toRem(14) 0 0;
    padding: toRem(12) toRem(14);
    box-shadow: inset 0 0 0 toRem(1.5) var(--color-comet);
    border-radius: toRem(14);
    background-color: var(--color-comet-14);
    color: var(--color-paper);
    line-height: 1.4;
    font-size: toRem(14);
  }

  &__cta {
    margin-top: toRem(20);

    &:first-child {
      margin-top: 0;
    }
  }

  &__notice + &__cta {
    margin-top: toRem(14);
  }

  &__restore {
    @include reset-button;
    @include focus-ring(var(--color-mint));

    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: toRem(44);
    color: var(--color-paper-85);
    line-height: 1.3;
    text-decoration: underline;
    font-size: toRem(14);

    &--dimmed {
      color: var(--color-paper-40);
      cursor: default;
    }
  }
}
</style>
