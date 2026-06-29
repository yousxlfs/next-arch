<div align="center">

# 🏗️ next-arch

**Архитектурные правила для Next.js 16 — чтобы ИИ и коллеги не могли сломать структуру проекта**

[![npm](https://img.shields.io/npm/v/next-arch?style=flat-square&color=black)](https://www.npmjs.com/package/next-arch)
[![npm](https://img.shields.io/npm/v/eslint-plugin-next-arch?style=flat-square&color=purple&label=eslint-plugin)](https://www.npmjs.com/package/eslint-plugin-next-arch)
[![CI](https://github.com/yousxlfs/next-archi/actions/workflows/ci.yml/badge.svg)](https://github.com/yousxlfs/next-archi/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/yousxlfs/next-archi?style=flat-square)](./LICENSE)

[Быстрый старт](#-быстрый-старт) · [Архитектура](#-слои) · [ESLint правила](#-eslint-плагин) · [🇬🇧 Read in English](./README.en.md)

</div>

---

## 😤 Проблема

Next.js даёт полную свободу. В этом и проблема.

Через пару недель активной разработки с ИИ проект выглядит примерно так:

```
components/
  UserCard.tsx
  useAuth.ts        ← хук в папке компонентов?
  fetchProducts.ts  ← апи-запрос рядом с UI?
  CartModal.tsx
app/
  page.tsx          ← 400 строк перемешанной логики
```

Нет правил → нет структуры → ИИ ломает архитектуру при каждой генерации.

Angular решает это из коробки. Next.js — нет.

**next-arch это исправляет.**

---

## ✅ Решение

CLI который разворачивает проект по [Feature-Sliced Design](https://feature-sliced.design/), адаптированному под Next.js 16 App Router — плюс ESLint плагин который автоматически защищает правила архитектуры.

```bash
# неправильный импорт — ESLint поймает сразу
import { useCart } from '../cart/hooks/useCart'
#                        ^^^^ next-arch/no-cross-feature-imports
# Ошибка: прямые импорты между фичами запрещены.
# Используй shared/ или передавай данные через props.
```

ИИ не сможет сломать архитектуру — линтер просто не даст собрать проект.

---

## 📦 Пакеты

| Пакет | Версия | Описание |
|---|---|---|
| [`next-arch`](./packages/next-arch) | [![npm](https://img.shields.io/npm/v/next-arch?style=flat-square)](https://npmjs.com/package/next-arch) | CLI — создаёт проекты и слайсы |
| [`eslint-plugin-next-arch`](./packages/eslint-plugin-next-arch) | [![npm](https://img.shields.io/npm/v/eslint-plugin-next-arch?style=flat-square)](https://npmjs.com/package/eslint-plugin-next-arch) | ESLint правила — защита архитектуры |

---

## ⚡ Быстрый старт

```bash
npx next-arch init my-app
cd my-app
pnpm install
pnpm dev
```

### Сгенерировать слайс

```bash
next-arch generate feature payments   # бизнес-фича
next-arch generate view dashboard     # страница
next-arch generate widget header      # крупный UI блок
next-arch generate entity user        # доменная сущность
```

Каждая команда создаёт полностью типизированный слайс с правильной структурой папок — никакой ручной возни.

---

## 🗂️ Слои

Импорты идут **только сверху вниз**. Нижние слои не знают о верхних.

```
src/
├── app/          # только роутинг Next.js — никакой логики здесь
├── views/        # сборка страниц из фич
├── widgets/      # крупные составные блоки (хедер, сайдбар, лента)
├── features/     # изолированные бизнес-модули
│   └── wishlist/
│       ├── actions/     # Server Actions
│       ├── api/         # запросы
│       ├── lib/         # хелперы
│       ├── model/       # типы и состояние
│       ├── ui/          # UI фичи
│       └── index.ts     # публичное API ← импортируй только отсюда
├── entities/     # доменные модели — типы, zod схемы, базовый UI
└── shared/       # никакой бизнес-логики — утилиты, ui kit, конфиг
    ├── ui/       # Button, Input, Modal...
    ├── lib/      # утилиты и хелперы
    ├── api/      # fetcher, обработка ошибок
    └── config/   # env, константы, роуты
```

---

## 🛡️ ESLint Плагин

Четыре правила которые защищают архитектуру на этапе линтинга и `next build`.

```js
// eslint.config.mjs
import nextArch from "eslint-plugin-next-arch";

export default defineConfig([
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

| Правило | Что запрещает |
|---|---|
| `no-cross-feature-imports` | `features/auth` импортирует из `features/cart` |
| `no-deep-imports` | `features/auth/hooks/useUser` — используй `index.ts` |
| `no-server-in-client` | серверный код (`db`, `server-only`) в файлах с `'use client'` |
| `no-upward-imports` | `shared/` импортирует из `features/` или выше |

---

## 🔥 Пример приложения

Смотри [`examples/next-app`](./examples/next-app) — реальный Next.js 16 проект построенный по этой архитектуре.

---

## 🛠️ Скрипты монорепо

```bash
pnpm install   # установить зависимости
pnpm build     # собрать все пакеты
pnpm dev       # dev режим через Turbo
pnpm lint      # линтинг
pnpm test      # тесты ESLint-плагина
```

---

<div align="center">

Сделано [yousxlfs](https://github.com/yousxlfs) · MIT License

**Если проект помог — поставь ⭐**

</div>
