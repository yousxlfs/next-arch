# Next Architecture

CLI и monorepo для Next.js 16 в стиле Feature-Sliced Design.

## Структура

```
next-arch/
├── packages/next-arch/              # CLI (next-arch)
├── packages/eslint-plugin-next-arch/ # ESLint-правила архитектуры
├── examples/next-app/               # эталонное приложение
└── turbo.json
```

## Быстрый старт

```bash
pnpm install
pnpm build
```

### Создать новый проект

```bash
pnpm --filter next-arch exec node dist/index.js init my-app
cd my-app
pnpm install
pnpm dev
```

Или после глобальной установки:

```bash
next-arch init my-app
```

### Сгенерировать слайс

Запускай из **корня Next.js проекта** (`examples/next-app/`), где есть `src/`:

```bash
cd next-arch/examples/next-app

# самый простой способ
pnpm arch generate feature payments

# или напрямую
node ../../packages/next-arch/dist/index.js generate feature payments
```

Из любой папки monorepo можно указать путь к проекту:

```bash
cd next-arch
pnpm next-arch generate feature payments --cwd examples/next-app
```

> `billing` уже создан ранее — используй другое имя или удали `src/features/billing`.

Глобальная команда `next-arch` (опционально, один раз):

```bash
pnpm setup
cd next-arch/packages/next-arch && pnpm link --global
```

Другие типы:

```bash
pnpm arch generate view dashboard
pnpm arch generate widget header
pnpm arch generate entity user
```

## Слои FSD

| Слой | Путь | Назначение |
|------|------|------------|
| `app` | `src/app` | Роутинг Next.js |
| `views` | `src/views` | Композиция страниц |
| `widgets` | `src/widgets` | Крупные UI-блоки |
| `features` | `src/features` | Бизнес-фичи |
| `entities` | `src/entities` | Доменные сущности |
| `shared` | `src/shared` | Общий код |

## ESLint-плагин

Пакет `eslint-plugin-next-arch` защищает архитектуру на этапе линтинга и `next build`.

| Правило | Что запрещает |
|---------|----------------|
| `no-cross-feature-imports` | Прямые импорты между разными фичами |
| `no-deep-imports` | Импорт внутрь чужой фичи мимо `index.ts` |
| `no-server-in-client` | Серверный код в файлах с `'use client'` |
| `no-upward-imports` | Импорт верхних слоёв из нижних (`shared` → `features` и т.д.) |

Подключение в `eslint.config.mjs`:

```js
import nextArch from "eslint-plugin-next-arch";

export default defineConfig([
  // ...eslint-config-next
  {
    plugins: { "next-arch": nextArch },
    rules: {
      "next-arch/no-cross-feature-imports": "error",
      "next-arch/no-deep-imports": "error",
      "next-arch/no-server-in-client": "error",
      "next-arch/no-upward-imports": "error",
    },
  },
]);
```

## Скрипты monorepo

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Запуск dev-режима через Turbo |
| `pnpm build` | Сборка всех пакетов |
| `pnpm lint` | Линтинг |
