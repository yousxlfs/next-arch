# next-arch

> **CLI + ESLint for Next.js App Router** — strict [Feature-Sliced Design](https://feature-sliced.design/) layout, enforced so AI and humans stop improvising folder structure.

next-arch is a CLI that creates a ready-to-use Next.js project on the App Router with a strict architecture, plus an ESLint plugin that keeps that architecture in check.

I built it for myself. Next.js doesn't give you a strict structure out of the box — you get full freedom, and that's the problem. From project to project the folder layout jumps around. Onboarding new people turns into constant confusion, files get moved for no reason, and AI (let's be honest — almost every developer uses it to some degree) often breaks things: imports `features/auth` from inside `features/cart`, drops a page component into widgets, invents a new folder because why not.

The plugin and the folder layout come from my own experience shipping projects, not from a tutorial.

---

## Why this exists (my take)

I've been on Next.js for a long time — 30+ projects, 5 of them fairly large. I even tried to bring it into a company as a replacement for Twig (yes, that still happens). A lot of boilerplate and routine work went to teammates or to AI. That was the last straw: structure kept getting mixed up, AI and junior devs produced huge files with no clear split, libraries were picked randomly. So I wrote strict rules for myself and for the team — and packaged them into this tool.

**Three things I wanted fixed:**

1. **Predictable folders** — new dev (or AI) opens `src/` and instantly knows where code lives
2. **Features don't leak into each other** — cart doesn't import auth; shared stuff goes to `shared/` or props from above
3. **Build fails before merge** — not a Notion doc nobody reads, but ESLint errors with a hint how to fix

**What next-arch is NOT:**

- Not a UI kit and not a replacement for [Next.js docs](https://nextjs.org/docs)
- Not a money grab — it's open source, I use it myself
- Goal: help juniors and teams who switch to Next.js and don't want to invent folder structure from scratch every time

---

## Mental model — how data flows

Not official FSD gospel — **how I actually wire apps**:

```
                    ┌─────────────────────────────────────┐
  Browser           │  app/page.tsx                       │
  request     ───►  │  (route only — imports a View)      │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  views/CheckoutView                 │
                    │  composes widgets + features        │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        widgets/header      features/cart        features/payments
              │                    │                    │
              └────────── shared/ (ui, lib, config) ─────┘
                                   │
                    Server: actions/ + api/  │  Client: ui/ + queries/
```

**Rule of thumb I use:**

| Question | Where it goes |
|----------|---------------|
| Next.js route / layout? | `app/` |
| Full screen composition? | `views/` |
| Reused chunk of UI (header, feed)? | `widgets/` |
| User action / business flow? | `features/<name>/` |
| Domain type (User, Product)? | `entities/` |
| Button, `cn()`, env, fetch wrapper? | `shared/` |

**Example: user clicks "Pay"**

1. `app/checkout/page.tsx` — only renders `<CheckoutView />`
2. `views/CheckoutView` — lays out header widget + cart feature + pay button
3. User clicks Pay → `features/payments/ui/PayButton` calls a Server Action from props (action passed from the View, not imported inside the client file)
4. `features/payments/actions/charge.ts` — talks to DB / API
5. On success → `queries/` refetches cart via TanStack Query

No feature imports another feature. View is the glue.

---

## Layers — what goes where (and what doesn't)

Imports only **down**: `app → views → widgets → features → entities → shared`

```
src/
├── app/              ← Next routes. Thin. No business logic.
├── views/            ← "Pages" as React components
├── widgets/          ← Big reusable blocks
├── features/         ← Business modules (the meat)
├── entities/         ← Domain models
└── shared/           ← Zero business logic
```

### `app/` — routing shell

**Put here:** `page.tsx`, `layout.tsx`, `loading.tsx`, providers wiring  
**Never here:** fetch logic, zustand stores, feature UI internals

> If `page.tsx` is longer than ~15 lines, I extract a View. Route file should read like a table of contents, not a novel.

---

### `views/` — page composition

**Put here:** one component = one screen (`CheckoutView`, `HomeView`)  
**Never here:** API calls, direct DB, cross-feature imports

Views **assemble** widgets and features. They pass data **down** via props.

> New view when the **screen layout** is different (checkout vs profile). Same view, different data — keep one view, change props from the page/server side.

---

### `widgets/` — large UI blocks

**Put here:** site header, sidebar, product grid shell  
**Never here:** payment logic, auth state (that lives in features)

> Widget = UI block used on **many pages**, no business rules inside. Header shows login button — but `features/auth` owns the logic; widget only renders a slot or imports `@/features/auth` through public API from the View layer, not from shared.

---

### `features/` — isolated business modules

This is where most code lives. One feature = one thing the user **does** (cart, auth, search).

```
features/cart/
├── ui/           ← React components ('use client' ok)
├── model/        ← types, zustand slice, local state
├── api/          ← fetch functions (server or client)
├── actions/      ← Server Actions ('use server') — never import in client
├── queries/      ← TanStack Query hooks ('use client')
├── lib/          ← helpers used ONLY inside this feature
├── types/
└── index.ts      ← PUBLIC API — the only import path from outside
```

**Golden rule:** from outside → `@/features/cart` only.  
From inside cart → relative imports (`../model/types`) are fine.

#### ❌ vs ✅ (what ESLint catches)

```ts
// ❌ cross-feature — cart stealing from auth
import { useUser } from '@/features/auth/hooks/useUser'

// ✅ pass user from a View above, or move hook to shared/
import { useUser } from '@/shared/lib/useUser'

// ❌ deep import — bypassing public API
import { CartButton } from '@/features/cart/ui/CartButton'

// ✅ public barrel only
import { CartButton } from '@/features/cart'
```

> **New feature or extend old one?** New folder when the user story is separate ("wishlist" vs "cart"). Same story, new button — extend the same feature. If two features need the same helper → `shared/` or `entities/`, not cross-import.

> **How features talk:** props from View, URL state (`nuqs`), TanStack Query cache, `shared/` utils. Never `features/a` → `features/b`.

---

### `entities/` — domain nouns

**Put here:** `User`, `Order`, `Product` — types, zod schemas, dumb `UserCard`  
**Not here:** "Add to cart" button (that's `features/cart`)

> `entities/user` = what a User **is** (type, avatar card). `features/auth` = what user **does** (login, logout). Cart uses `@/entities/user` for display, not `@/features/auth`.

---

### `shared/` — toolbox

**Put here:** `Button`, `cn()`, `env.ts`, generic hooks  
**Never here:** anything that mentions "cart", "checkout", "auth flow"

If `shared/` starts importing from `features/` — architecture is already broken.

---

## Server vs Client (how I split it)

| Code | Folder | Directive |
|------|--------|-----------|
| Server Actions | `features/*/actions/` | `'use server'` |
| DB, cookies, headers | server files / actions | never in `'use client'` |
| Interactive UI | `features/*/ui/` | `'use client'` |
| Data fetching in browser | `features/*/queries/` | `'use client'` |

**Pattern I use:** Server Component (view/page) calls action → passes result as props to client component.

> Example: `CheckoutView` (server) imports `chargeOrder` action and passes it to `<PayButton onPay={chargeOrder} />`. Client never does `import { chargeOrder } from '../actions/charge'`.

---

## Project types at init

When you `init`, you pick how heavy the scaffold is:

| Type | Layers kept | When I pick it |
|------|-------------|----------------|
| `full` | all 6 layers | product app, dashboard, long-lived team project |
| `standard` | no views/widgets | internal admin, CRUD, MVP backend UI |
| `simple` | features + shared only | landing, marketing site, portfolio |

> Real usage: `simple` for a 3-page marketing site. `full` for a SaaS with header widget, multiple features, and entities. `standard` when I know I won't need widgets yet but still want `entities/user`.

---

## Install

```bash
npx @yousxlfs/next-arch init my-app
cd my-app
pnpm install
pnpm dev
```

Node 20+. Plugin-only on existing project:

```bash
pnpm add -D eslint-plugin-next-arch
```

---

## What's in the repo

| Package | What it does |
|---------|--------------|
| [`@yousxlfs/next-arch`](./packages/next-arch) | CLI — init, generate, page presets, doctor |
| [`eslint-plugin-next-arch`](./packages/eslint-plugin-next-arch) | 4 import rules |
| [`examples/next-app`](./examples/next-app) | living reference — open it when unsure |

After `init` you also get: `AGENTS.md` for AI tools, eslint plugin in `vendor/`, TanStack Query, providers, optional `_examples/`.

---

## Commands

```bash
# new project
next-arch init my-app
next-arch init my-app -y --no-examples --project-type simple

# slices
next-arch generate feature payments
next-arch g view dashboard
next-arch generate widget header
next-arch generate entity user

# full page (routes + views + features + entities)
next-arch page orders --preset crud    # auth | crud | dashboard | profile | settings | blank

# quick check without full eslint run
next-arch doctor
```

Flags worth knowing: `--output-dir`, `--project-type`, `--cwd`, `-f` (force overwrite).

---

## ESLint — the enforcement layer

CLI scaffolds structure. **Plugin makes violations impossible to ignore.**

| Rule | Plain English |
|------|---------------|
| `no-cross-feature-imports` | features don't import features |
| `no-deep-imports` | only `@/features/name`, not internal paths |
| `no-server-in-client` | no server modules in client components |
| `no-upward-imports` | lower layer can't pull from upper |

```js
import plugin from 'eslint-plugin-next-arch';
export default [plugin.configs.recommended];
```

> Real catch: Cursor added `import { login } from '@/features/auth'` inside `features/cart/ui/Cart.tsx`. ESLint: *"Cannot import from feature auth inside feature cart. Move shared logic to shared/ or pass data via props."* — exactly the bug I kept fixing by hand.

---

## Contributing

```bash
git clone https://github.com/yousxlfs/next-arch.git
cd next-arch && pnpm install && pnpm build && pnpm test
```

Edit `examples/next-app` → run `pnpm sync:template`.

Bug or idea → [issues](https://github.com/yousxlfs/next-arch/issues)

---

MIT · [yousxlfs](https://github.com/yousxlfs)
