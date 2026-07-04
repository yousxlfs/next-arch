# next-arch — AI Agent Rules

> Rules for AI assistants (Cursor, GitHub Copilot, Claude) working on this Next.js project.
> Scaffolded with [next-arch](https://github.com/yousxlfs/next-archi). Follow strictly.

---

## Project Overview

**Stack:** Next.js 16, React 19, Tailwind 4, shadcn/ui, TypeScript strict, ESLint 9

**Architecture:** Feature-Sliced Design (FSD) — enforced by `eslint-plugin-next-arch` at lint/build time.

```
src/
├── app/          # Next.js App Router (routes, layout, providers)
├── views/        # Page compositions (optional — depends on project type)
├── widgets/      # Reusable UI blocks (optional)
├── features/     # Business logic slices
├── entities/     # Domain models (optional)
└── shared/       # UI kit, lib, providers, config
```

---

## FSD Layer Hierarchy

Imports only **top → bottom** (higher layer may import lower):

```
app (5) → views (4) → widgets (3) → features (2) → entities (1) → shared (0)
```

Lower layers **never** import from upper layers.

---

## Feature Structure

```
features/<name>/
├── ui/           # React components ('use client' where needed)
├── model/        # types, zustand store
├── api/          # fetch functions (no 'use server')
├── lib/          # pure helpers
├── actions/      # Server Actions ('use server')
├── queries/      # TanStack Query hooks ('use client')
├── types/        # TypeScript types
└── index.ts      # ONLY public API — single door out
```

---

## Import Rules (ESLint enforced)

```ts
// ✅ Correct
import { PaymentForm } from '@/features/payments'
import { Button } from '@/shared/ui'
import { UserCard } from '@/entities/user'

// ❌ Deep import — bypasses public API
import { PaymentForm } from '@/features/payments/ui/PaymentForm'

// ❌ Cross-feature import
import { useAuth } from '@/features/auth'  // inside features/payments/

// ❌ Server code in client file
'use client'
import { cookies } from 'next/headers'

// ❌ Upward import — shared importing features
import { usePayments } from '@/features/payments'  // inside shared/
```

**Fix cross-feature needs:** pass data via props from views/widgets, or move shared logic to `shared/` or `entities/`.

---

## ESLint Rules (all `error`)

| Rule | Blocks |
|------|--------|
| `no-cross-feature-imports` | `features/A` → `features/B` |
| `no-deep-imports` | `@/features/name/internal/path` from outside |
| `no-server-in-client` | server-only imports in `'use client'` files |
| `no-upward-imports` | lower layer → upper layer |

Run `npm run lint` before committing.

---

## shadcn/ui

- Components live in **`shared/ui/`** (not `components/ui`)
- `components.json` aliases point to `@/shared/ui` and `@/shared/lib/utils`
- Add components: `npx shadcn add <name>`
- Import from public API: `import { Button } from '@/shared/ui'`

---

## Server vs Client

| Code | Location | Import in `'use client'`? |
|------|----------|---------------------------|
| Server Actions | `features/*/actions/` | ❌ pass via props |
| TanStack Query hooks | `features/*/queries/` | ✅ |
| Prisma, Redis, `server-only` | `actions/` or server modules | ❌ |
| UI components | `features/*/ui/` | ✅ with `'use client'` |

---

## CLI Commands (next-arch)

```bash
npx next-arch g feature <name>    # new feature slice
npx next-arch g view <name>       # new view
npx next-arch g widget <name>     # new widget
npx next-arch g entity <name>     # new entity
npx next-arch page <name>         # full page with preset
npx next-arch doctor              # check FSD structure
npx next-arch doctor --cwd .      # explicit project root
```

Use `--force` to overwrite existing slices.

---

## Core Principles

1. **Minimal diff** — change only what's needed
2. **Public API only** — external imports go through `index.ts`
3. **No business logic in views** — compose features, don't implement
4. **No cross-feature imports** — use shared/ or props
5. **Run lint** — architecture violations fail CI

---

## What NOT To Do

```
❌ Import from @/features/name/ui/... or other internal paths
❌ Import one feature from another feature directly
❌ Put Server Actions or DB access in 'use client' files
❌ Add files outside the correct FSD layer
❌ Skip index.ts public API when adding exports
❌ Install shadcn components to components/ui — use shared/ui
```

---

## Quick Reference

```bash
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint + FSD rules
npx next-arch doctor   # architecture health check
```
