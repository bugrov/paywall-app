<template>
  <main class="stub">
    <h1 class="stub__title">
      Комета Кузя
    </h1>
    <p class="stub__text">
      Каркас проекта готов. Экран paywall появится на следующих этапах.
    </p>
  </main>
</template>

<style scoped lang="scss">
.stub {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: toRem(12);
  padding: toRem(24) toRem(20);
  min-height: 100dvh;

  &__title {
    color: var(--color-comet);
    line-height: 1.2;
    font-family: var(--font-display);
    font-size: toRem(24);
    font-weight: 700;
  }

  &__text {
    max-width: toRem(320);
    line-height: 1.5;
    font-size: toRem(16);
  }
}
</style>
