<script setup lang="ts">
import markIcon from '~/assets/img/selected-mark.svg'

defineProps<{
  offer: Offer
  selected: boolean
  dimmed: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  select: [offerId: string]
}>()
</script>

<template>
  <label
    class="offer"
    :class="{ 'offer--selected': selected, 'offer--dimmed': dimmed }"
  >
    <input
      class="offer__input"
      type="radio"
      name="offer"
      :value="offer.id"
      :checked="selected"
      :disabled="disabled"
      @change="emit('select', offer.id)"
    >
    <span class="offer__title">{{ offer.title }}</span>
    <span class="offer__price">{{ formatPrice(offer.price) }}</span>
    <span class="offer__note">{{ formatOfferNote(offer) }}</span>
    <span
      v-if="offer.badge"
      class="offer__badge"
    >{{ offer.badge }}</span>
    <img
      v-if="selected"
      class="offer__mark"
      :src="markIcon"
      alt=""
      width="24"
      height="24"
    >
  </label>
</template>

<style scoped lang="scss">
.offer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: toRem(2);
  padding: toRem(14);
  min-width: 0;
  min-height: toRem(112);
  box-shadow: inset 0 0 0 toRem(1.5) var(--color-lilac-50);
  border-radius: toRem(20);
  background-color: var(--color-paper-07);
  color: var(--color-paper);
  line-height: 1.3;
  cursor: pointer;

  &--selected {
    // Обводка снаружи, как в макете: размер карточки не меняется
    box-shadow: 0 0 0 toRem(3) var(--color-comet);
    background-color: var(--color-paper);
    color: var(--color-night);
  }

  &--dimmed {
    opacity: 0.5;
  }

  &:has(&__input:focus-visible) {
    outline: toRem(3) solid var(--color-mint);
    outline-offset: toRem(6);
  }

  &__input {
    @include visually-hidden;
  }

  &__title {
    font-size: toRem(16);
    font-weight: 600;
  }

  &__price {
    font-family: var(--font-display);
    font-size: toRem(20);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__note {
    color: var(--color-paper-80);
    font-size: toRem(13);
  }

  &--selected &__note {
    color: var(--color-night-75);
  }

  &__badge {
    position: absolute;
    top: -1 * toRem(11);
    right: toRem(12);
    padding: toRem(3) toRem(9);
    border-radius: toRem(999);
    background-color: var(--color-mint);
    color: var(--color-night);
    font-size: toRem(12);
    font-weight: 700;
    white-space: nowrap;
  }

  &__mark {
    position: absolute;
    top: -1 * toRem(9);
    left: -1 * toRem(9);
    width: toRem(24);
    height: toRem(24);
  }
}
</style>
