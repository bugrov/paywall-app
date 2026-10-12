<template>
  <div
    class="skeleton"
    aria-hidden="true"
  >
    <span class="skeleton__line skeleton__line--short" />
    <span class="skeleton__line skeleton__line--price" />
    <span class="skeleton__line skeleton__line--note" />
  </div>
</template>

<style scoped lang="scss">
.skeleton {
  display: flex;
  flex-direction: column;
  gap: toRem(2);
  padding: toRem(14);
  min-width: 0;
  min-height: toRem(112);
  border-radius: toRem(20);
  background-color: var(--color-paper-07);

  &__line {
    display: block;
    border-radius: toRem(6);
    background-color: var(--color-paper-14);

    &--short {
      width: toRem(70);
      height: toRem(16);
    }

    &--price {
      width: toRem(110);
      height: toRem(24);
    }

    &--note {
      width: toRem(90);
      height: toRem(14);
    }
  }
}
</style>
