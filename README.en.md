# Next Architecture

CLI and monorepo for Next.js 16 with Feature-Sliced Design.

[![CI](https://github.com/yousxlfs/next-archi/actions/workflows/ci.yml/badge.svg)](https://github.com/yousxlfs/next-archi/actions/workflows/ci.yml)

[🇷🇺 Читать на русском](./README.md)

## Packages

| Package | Description |
|---------|-------------|
| [`next-arch`](./packages/next-arch) | CLI — scaffold projects and generate FSD slices |
| [`eslint-plugin-next-arch`](./packages/eslint-plugin-next-arch) | ESLint rules that enforce architecture boundaries |
| [`examples/next-app`](./examples/next-app) | Reference Next.js application |

## Quick start

```bash
pnpm install
pnpm build
```

### Create a project

```bash
npx next-arch init my-app
cd my-app
pnpm install
pnpm dev
```

### Generate a slice

```bash
pnpm arch generate feature auth
pnpm arch generate view dashboard
pnpm arch generate widget header
pnpm arch generate entity user
```

## FSD layers

| Layer | Path | Purpose |
|-------|------|---------|
| `app` | `src/app` | Next.js routing |
| `views` | `src/views` | Page compositions |
| `widgets` | `src/widgets` | Large UI blocks |
| `features` | `src/features` | Business features |
| `entities` | `src/entities` | Domain entities |
| `shared` | `src/shared` | Shared code |

## ESLint plugin

| Rule | What it blocks |
|------|----------------|
| `no-cross-feature-imports` | Direct imports between features |
| `no-deep-imports` | Imports into a feature bypassing `index.ts` |
| `no-server-in-client` | Server code inside `'use client'` files |
| `no-upward-imports` | Lower layers importing upper layers |

## License

MIT © [yousxlfs](https://github.com/yousxlfs)
