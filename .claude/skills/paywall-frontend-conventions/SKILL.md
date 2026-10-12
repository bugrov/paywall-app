---
name: paywall-frontend-conventions
description: Правила верстки проекта paywall: БЭМ, SCSS scoped, миксины и toRem, CSS-токены, порядок свойств stylelint, mobile-first и pixel-perfect по Figma. Используй при создании или правке любых .vue, .scss и стилей.
---

# Конвенции фронтенда

Стили: обычный SCSS + БЭМ + миксины. Tailwind в проекте не используется.

## Структура компонента
```vue
<template>
  <section class="offer-card offer-card--selected">
    <h3 class="offer-card__title">...</h3>
    <span class="offer-card__badge">...</span>
  </section>
</template>

<script setup lang="ts">
// props, emits, composables
</script>

<style scoped lang="scss">
.offer-card {
  /* свойства строго в порядке из .stylelintrc.json */
  &__title { }
  &--selected { }
}
</style>
```
- БЭМ: `block`, `block__element`, `block--modifier`, kebab-case. Один блок на компонент, имя блока
  совпадает с файлом (`OfferCard.vue` -> `.offer-card`).
- Вложенность `&__` не глубже одного уровня. Состояния через модификаторы, не через теги и не через `:deep`.
- Повторяющееся оформление выноси в миксины.

## Токены, единицы, миксины
- Цвета и шрифты только через CSS-переменные из `app/assets/scss/main.scss`:
  `var(--color-night|comet|mint|lilac|paper)`, `var(--font-display)`, `var(--font-body)`.
  Новый цвет сначала добавляется в `:root`, не в компонент.
- Размеры из макета в пикселях пиши как `toRem(24)`. Голые `px` только для границ в 1-2px.
- Функция и миксины лежат в `app/assets/scss/_mixins.scss` и подключены автоматически
  (`additionalData` в `nuxt.config.ts`), `@use` в компонентах писать не нужно:
  `toRem()`, `focus-ring`, `tap-target`, `reset-button`.
- Новый миксин добавляй в `_mixins.scss`, а не копируй блок свойств по компонентам.

## Порядок свойств
Задаёт `.stylelintrc.json` (позиция, display, flex/grid, отступы, размеры, декор, фон, цвет,
типографика). Не угадывай: пиши и запускай `npm run lint:style:fix`.

## Mobile-first и pixel-perfect
- База 390px, проверка 360 и 430. Стили пишутся для узкого экрана, `@media (min-width)` только при необходимости.
- Контент не шире `toRem(430)` и центрируется. Горизонтального скролла нет.
- Размер нажатия не меньше 44px (`tap-target`). Видимый `:focus-visible` на каждом интерактивном элементе.
- Высота экрана через `100dvh`, отступы с `env(safe-area-inset-*)`.
- `prefers-reduced-motion`: анимации отключаются. Анимация только по действию пользователя или одна на входе.
- Числа в ценах: `font-variant-numeric: tabular-nums`.
- Сверка с Figma: размеры, отступы, радиусы, межстрочные и веса берём из `get_design_context` и
  `get_variable_defs`, затем сравниваем скриншоты на трёх ширинах. Расхождение больше 1px чиним.

## Тексты
Русский, активный залог, глагол в кнопке: «Открыть всё», «Восстановить покупки». Ошибка говорит, что
случилось и что делать, без извинений. Название действия одинаково на кнопке и в тосте.
