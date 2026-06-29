# Changelog

## v0.1.0 — 2026-06-29

### Added

- **CLI `next-arch`**
  - `init <name>` — scaffold a Next.js 16 project with FSD structure
  - `init --cwd <path>` — create project in a specific directory
  - `generate <type> <name>` — generate `feature`, `view`, `widget`, or `entity` slices
  - `generate --cwd <path>` — generate into a specific project
  - `generate --force` — overwrite an existing slice
  - Bundles `eslint-plugin-next-arch` into every new project

- **ESLint plugin `eslint-plugin-next-arch`**
  - `no-cross-feature-imports`
  - `no-deep-imports`
  - `no-server-in-client`
  - `no-upward-imports`

- **Example app** — Next.js 16, React 19, Tailwind 4, shadcn/ui

- **Monorepo** — pnpm workspaces, Turbo, GitHub Actions CI
