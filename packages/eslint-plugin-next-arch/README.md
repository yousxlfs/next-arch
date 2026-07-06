# eslint-plugin-next-arch

ESLint rules for Next.js + Feature-Sliced Design. Catches bad imports before merge — with messages that explain **how to fix**.

Works standalone or bundled via `@yousxlfs/next-arch init`.

**Full docs:** [github.com/angeloscode/next-arch](https://github.com/angeloscode/next-arch)

## Install

```bash
pnpm add -D eslint-plugin-next-arch
```

Peer dependency: ESLint 9+.

## Setup (flat config)

```js
import plugin from 'eslint-plugin-next-arch';

export default [plugin.configs.recommended];
```

## Rules

| Rule | What it blocks |
|------|----------------|
| `no-cross-feature-imports` | `features/cart` importing from `features/auth` |
| `no-deep-imports` | `@/features/cart/ui/Button` — use `@/features/cart` only |
| `no-server-in-client` | server modules / `'use server'` files inside `'use client'` |
| `no-upward-imports` | `shared/` importing from `features/` or upper layers |

### Example

```ts
// ❌ blocked
import { useUser } from '@/features/auth/hooks/useUser'  // inside features/cart

// ✅ fix: shared/, props from View, or public API
import { useUser } from '@/shared/lib/useUser'
```

## Settings

```js
settings: {
  'next-arch': {
    srcDir: 'src',  // default
  },
},
```

## Issues

[github.com/angeloscode/next-arch/issues](https://github.com/angeloscode/next-arch/issues)

MIT © [angeloscode](https://github.com/angeloscode)
