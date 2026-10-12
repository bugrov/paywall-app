// Схема единственной таблицы. Выполняется лениво при первом обращении к БД (см. server/utils/db.ts),
// поэтому отдельный шаг миграции при деплое не нужен.
export const SCHEMA_STATEMENTS = [
  `create table if not exists purchases (
    id uuid primary key default gen_random_uuid(),
    offer_id text not null,
    device_id text not null,
    idempotency_key text not null unique,
    created_at timestamptz not null default now()
  )`,
  'create index if not exists purchases_device_id_idx on purchases (device_id, created_at desc)'
]
