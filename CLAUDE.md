# Paywall для детской игры «Комета Кузя»

Тестовое задание: мобильный paywall в webview. Пользователь выбирает один из двух тарифов, нажимает
CTA, тестовая покупка записывается в БД. Платёжных SDK и реальных денег нет.

Репозиторий: `git@github.com:bugrov/paywall-app.git`. Деплой: Vercel. История этапов: `.claude/project-state.md`.

## Стек
- Nuxt 4 (`app/` для фронтенда, `server/` для Nitro), TypeScript strict, npm.
- Стили: обычный SCSS в `<style scoped lang="scss">`, именование БЭМ, миксины и функция `toRem()` в
  `app/assets/scss/_mixins.scss` (подключаются в каждый SCSS-блок автоматически через
  `vite.css.preprocessorOptions.scss.additionalData`). Tailwind не используем.
- Токены: CSS-переменные в `:root` в `app/assets/scss/main.scss`, в компонентах через `var(--color-*)`.
- Шрифты: `@nuxt/fonts` (Unbounded 700 для заголовков и цен, Onest 400/600 для текста).
- БД: Neon Postgres через Vercel Marketplace, драйвер `@neondatabase/serverless` (появится на этапе 4).
- Качество: ESLint (`@nuxt/eslint`), Stylelint (`.stylelintrc.json`), `vue-tsc` через `nuxt typecheck`.

## Архитектура
```
app/
  app.vue                          оболочка, <NuxtPage />
  pages/index.vue                  связывает usePaywall с PaywallScreen (+ ?preview в dev)
  components/paywall/
    PaywallScreen.vue              весь экран, презентационный (props + emits)
    OfferCard.vue                  карточка тарифа (radio внутри label)
    OfferCardSkeleton.vue          скелетон карточки
    PurchaseButton.vue             CTA: обычная, неактивная, со спиннером
  composables/usePaywall.ts        тарифы, выбор, покупка, статус экрана
  composables/useDeviceId.ts       device_id в cookie (UUID на год)
  utils/format.ts, utils/id.ts     формат цены и подписи, createId()
  assets/img/*.svg                 иллюстрации и иконки, выгружены из Figma
  assets/scss/main.scss            токены (:root), базовый сброс
  assets/scss/_mixins.scss         toRem(), focus-ring, tap-target, visually-hidden, reset-button
server/
  api/offers.get.ts                GET /api/offers
  api/purchase.post.ts             POST /api/purchase (этап 3: заглушка без БД)
  utils/offers.ts                  каталог тарифов, findOffer()
shared/types/paywall.ts            Offer, PurchaseRequest, PurchaseResponse, PaywallStatus
```
Появится на этапе 4: `server/utils/db.ts` (Neon) и `server/db/schema.sql` (таблица purchases).

Поток: страница вызывает `GET /api/offers`, рисует две карточки, по CTA шлёт `POST /api/purchase`
с `offerId`, `deviceId` и заголовком `Idempotency-Key`; сервер валидирует, записывает покупку, отвечает
успехом; фронт показывает состояние успеха или ошибки. Повтор после ошибки использует тот же
`Idempotency-Key`, смена тарифа сбрасывает его.

Состояния экрана (`PaywallStatus`): `loading`, `ready`, `purchasing`, `error`, `success`. В dev их можно
открыть без API: `/?preview=loading|purchasing|error|success`.

## Токены дизайна (концепт «Комета Кузя»)
night `#1B1F4B` фон, comet `#FF7A3D` CTA и выбранная карточка, mint `#5EEAD4` плашка «выгода»,
lilac `#B9A7FF` рамки, paper `#FFF8EC` текст и выбранная карточка. Ширина экрана 360-430px, база 390px.

## Запуск локально
```bash
npm install
cp .env.example .env     # заполнить DATABASE_URL (Neon), см. ниже
npm run dev              # http://localhost:3000
```
Команды: `npm run lint`, `npm run lint:style`, `npm run typecheck`, `npm run check` (все три),
`npm run build`, `npm run preview`.

Node: Nuxt 4.6 требует `^22.21 || ^24.11 || >=26`. На 22.15 всё собирается, но выводится предупреждение;
на Vercel выбрана подходящая версия.

## Роуты
| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/offers` | тарифы: `id`, `title`, `price`, `period`, `badge?`, `pricePerMonth?` |
| POST | `/api/purchase` | тело `{ offerId, deviceId }`, заголовок `Idempotency-Key`; пишет в `purchases` |

## Правила работы
- Любое изменение стилей идёт через токены, значения в пикселях через `toRem()`.
- Порядок CSS-свойств задаёт `.stylelintrc.json`; чинится `npm run lint:style:fix`.
- Перед завершением этапа: `npm run check`, затем ревью по скиллу `paywall-review`.
- Этапы, цикл «проверка, ревью, стоп, ОК, коммит, пуш»: скилл `paywall-stage-workflow`.
- Стили и верстка, pixel-perfect: скилл `paywall-frontend-conventions`.
- Секреты только в `.env` и в переменных Vercel. `.env` в git не попадает.
- Каждый этап фиксируется в `.claude/project-state.md`: что сделано, что осталось, какие решения приняты.
