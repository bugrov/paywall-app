# Комета Кузя: paywall

Мобильный paywall детской игры для webview: два тарифа, выбор, тестовая покупка с записью в БД.

- Живой сервис: https://paywall-app-phi.vercel.app
- Репозиторий: https://github.com/bugrov/paywall-app
- Макет Figma: https://www.figma.com/design/J3vsiNAENs7aYT5DENtZ5w (5 состояний на 390px, варианты 360 и 430)

## Запуск локально
```bash
npm install
cp .env.example .env   # вписать DATABASE_URL (строка подключения Neon) или: vercel env pull .env
npm run dev            # http://localhost:3000
npm run check          # eslint + stylelint + vue-tsc
```
Node 24 (`.nvmrc`; Nuxt 4.6 требует `^22.22.3 || ^24.15.0 || >=26`). Без `DATABASE_URL` экран и
`GET /api/offers` работают, покупка и восстановление отвечают 500. В dev состояния экрана открываются
через `/?preview=loading|purchasing|error|success`.

## Где что
- **Frontend:** `app/pages/index.vue`, `app/components/paywall/*`, логика в `app/composables/usePaywall.ts`.
  Стили: БЭМ + scoped SCSS, токены в `app/assets/scss/main.scss`, миксины и `toRem()` в `_mixins.scss`.
- **Server routes:** `server/api/offers.get.ts` (тарифы), `server/api/purchase.post.ts` (покупка),
  `server/api/purchases.get.ts` (восстановление).
- **БД:** `server/utils/db.ts` (клиент Neon), `server/db/schema.ts` (таблица `purchases`: `offer_id`,
  `device_id`, `idempotency_key`, `created_at`). Таблица создаётся при первом запросе, миграций нет.

## Платформа и БД
- **Vercel:** нативная поддержка Nuxt и server routes, деплой из GitHub на каждый пуш в `main`.
- **Neon Postgres** через Vercel Marketplace: бесплатный тариф, переменные окружения подключаются
  сами, HTTP-драйвер работает в serverless без пула соединений. Одной таблицы хватает, ORM не нужен.

## Как работает покупка
`POST /api/purchase` принимает `{ offerId, deviceId }` и заголовок `Idempotency-Key`. Повтор с тем же
ключом возвращает ту же покупку, а не создаёт вторую (проверено 8 параллельными запросами); тот же ключ
с другими данными даёт 409. `deviceId` это UUID из cookie, условный идентификатор, не секрет.

## AI-инструменты и что проверено
Код писал Claude Code (Sonnet 5.5): Figma MCP (макет и выгрузка размеров), Vercel CLI и интеграция Neon,
Playwright и headless Chrome для проверок, агенты ревью (логика, тихие сбои, безопасность API, практики
Nuxt, документация). Каждый этап показывался автору и принимался после его проверки. Дополнительно:
- `npm run check` и `npm run build` на каждом этапе; diff этапа прочитан целиком;
- сверка с Figma по скриншотам: блоки расходятся не больше чем на 1px (390 и 360);
- API на проде: плохие входы, идемпотентность, гонка, восстановление, чужое устройство, ответы без stack trace;
- UI в браузере: выбор мышью и стрелками, обрыв и повтор запроса, успех, восстановление;
- итоговое ревью нашло таймауты, проверку ответов и заголовки: исправлено; уязвимости `npm audit`
  относятся только к build-зависимостям Nuxt и в деплоимый бандл не попадают.

**Не проверялось:** реальные iOS и Android webview, только Chrome; нагрузка и квоты Neon.

## Упрощения
- Каталог тарифов лежит в коде (`server/utils/offers.ts`), не в БД: для задания не нужно, и paywall
  не зависит от доступности базы.
- «Закрыть» вызывает `window.close()`: настоящий мост с нативным приложением зависит от платформы.
- Состояния кроме основного сверены по спецификации Figma, а не по свежим скриншотам: на тарифе
  Starter закончился лимит вызовов Figma MCP.
- Повторная покупка на том же устройстве создаёт вторую запись: логики «уже куплено» нет.

## Если бы было ещё 2 часа
1. Автотесты: Vitest на роуты покупки (идемпотентность, 409) и Playwright-сценарий в CI.
2. Ограничение частоты запросов к `/api/purchase` (правило Vercel Firewall) и серверная HttpOnly-cookie
   вместо `deviceId` в запросе: id сейчас оседает в логах доступа.
3. Тарифы в таблице `offers` с внешним ключом из `purchases.offer_id`, статус «уже куплено».
4. Проверка на реальных устройствах и скриншот-тесты регрессии на 360, 390 и 430.
