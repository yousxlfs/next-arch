# Changelog

## eslint-plugin-next-arch 0.2.2

### Fixes

-   Repository URLs updated to `github.com/angeloscode/next-arch` (npm provenance)

## 0.3.4

### Features

-   **`next-arch remove` / `rm`** — delete a `feature`, `view`, `widget`, or `entity` slice with confirmation
    -   Scans the project for files that import the slice (`@/features/name`, deep paths, relative imports, `export from`, dynamic `import()`, `require()`)
    -   Prints a warning list before removal: *"These imports will break after removal"*
    -   `--force` / `-f` skips the confirmation prompt (warnings still shown)
    -   `--cwd` for running outside the project root

### Fixes

-   **`next-arch doctor`** — detects side-effect imports (`import 'server-only'`) and `require()` in client files, matching ESLint `no-server-in-client`
-   Repository URLs updated to `github.com/angeloscode/next-arch` (fixes npm publish provenance after GitHub username change)

### Tests

-   **186+ CLI tests** — architecture coverage, `remove` / `findImporters`, example-app ESLint + doctor integration
-   Expanded ESLint plugin tests (layers, configs, rule edge cases)

### Docs

-   `remove` command documented in root README and `packages/next-arch/README.md` (npm)

## 0.3.3

### Docs

-   Package-level `README.md` for `@yousxlfs/next-arch` and `eslint-plugin-next-arch` (shown on npm)
-   Expanded test suite and example-app integration checks

## 0.3.2

### Fixes

-   CRUD preset: `Product*` placeholders → correct `{{Name}}*` names
-   Doctor aligned with ESLint (cross-feature, deep imports, upward, server-in-client)
-   `init`: `--output-dir` for parent directory; `--cwd` deprecated on init
-   Page presets use `ui/` instead of `components/`
-   ESLint plugin `meta.version` synced from package.json

### Features

-   `full` template includes entities and widgets layers
-   Demo feature wired with TanStack Query
-   Slim root `AGENTS.md`
-   Package manager hint on init (pnpm/yarn/npm)
-   38+ CLI tests, expanded ESLint rule tests

### Docs

-   English README with architecture theory and examples

## eslint-plugin-next-arch 0.2.1

-   Better error messages with fix hints
-   `export from`, `require()`, middleware as app layer
-   `configs.recommended` includes `srcDir` setting

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
