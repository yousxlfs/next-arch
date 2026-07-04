# Changelog

## 0.3.1

-   Inject scaffold deps from packages.ts instead of template package.json
-   Pin exact versions in example app (no ^)
-   Slim template tarball for clearer supply chain footprint

## v0.3.0

### Features

-   **Project type selection** — choose architecture depth at init:
    `full` (all FSD layers), `standard` (features + entities + shared), `simple` (landing pages)
-   **`next-arch doctor`** — new command that checks FSD structure validity without running ESLint.
    Detects missing `index.ts`, cross-feature imports, server code in client files
-   **Auto-providers** — CLI automatically assembles `app/providers/index.tsx` based on selected packages.
    Choose Redux + Sonner → providers wired up with zero manual work
-   **Root `AGENTS.md`** — every generated project includes a single root `AGENTS.md` with FSD rules for AI assistants.
    No per-slice `AGENTS.md` and no `CLAUDE.md`
-   **`queries/` and `types/` in feature template** — generated features now include dedicated folders
    for TanStack Query hooks and TypeScript types

### Fixes

-   **PACKAGE_VERSIONS** — removed all `^` and `~` from dependency versions.
    Projects created with `init` now have deterministic installs
-   **shadcn components** — moved from `components/ui/` to `shared/ui/` to correctly reflect shared layer rank
-   **sync-template.mjs** — fixed path resolution when running from monorepo root
-   **`init -y`** — merges into an existing project directory without confirmation prompt

### Tests

-   Added **vitest** test suite for CLI — 11+ tests covering `generate feature`, `generate view`,
    `generate entity`, `generate widget`, `--force` flag, and `doctor` command
-   Tests verify slice templates do not generate per-slice `AGENTS.md`

### Infrastructure

-   **Changesets** configured for versioning and changelog automation
-   **`--project-type`** flag added to `init` command (`full` | `standard` | `simple`)
-   **`--no-examples`** correctly skips `_examples/` folder generation

## v0.2.0 — 2026-06-29

### Added

-   **Interactive `init`** — package selection via `@clack/prompts` (state, forms, optional deps)
    -   `-y` / `--yes` — default selections without prompts
    -   `--no-examples` — skip commented example files
-   **`page` command** — full FSD page scaffolding with presets: `auth`, `dashboard`, `crud`, `profile`, `settings`, `blank`
-   **`generate page`** — alias for page generation
-   **`templates/packages/`** — core + example files per optional package
-   **`pnpm sync:template`** — sync `examples/next-app` → `templates/app`

## v0.1.0 — 2026-06-29

### Added

-   **CLI `@yousxlfs/next-arch`**

    -   `init <name>` — scaffold a Next.js 16 project with FSD structure
    -   `init --cwd <path>` — create project in a specific directory
    -   `generate <type> <name>` — generate `feature`, `view`, `widget`, or `entity` slices
    -   `generate --cwd <path>` — generate into a specific project
    -   `generate --force` — overwrite an existing slice
    -   Bundles `eslint-plugin-next-arch` into every new project

-   **ESLint plugin `eslint-plugin-next-arch`**

    -   `no-cross-feature-imports`
    -   `no-deep-imports`
    -   `no-server-in-client`
    -   `no-upward-imports`

-   **Example app** — Next.js 16, React 19, Tailwind 4, shadcn/ui

-   **Monorepo** — pnpm workspaces, Turbo, GitHub Actions CI
