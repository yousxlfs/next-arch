# next-arch — AI Agent Rules

> Rules for AI assistants (Cursor, GitHub Copilot, Claude) working on the **next-arch monorepo**.
> Follow strictly.

---

## Project Overview

**next-arch** — open-source toolchain for Next.js 16 with Feature-Sliced Design (FSD):

- `packages/next-arch` — CLI (`@yousxlfs/next-arch`)
- `packages/eslint-plugin-next-arch` — ESLint rules
- `examples/next-app` — reference application (source of truth for `templates/app`)

**Stack:** Node 20+, TypeScript strict, pnpm 9, Turbo, tsup, commander, @clack/prompts

---

## Core Principles

1. **Minimal diff** — never rewrite working code
2. **Templates over hardcode** — structure in `templates/`, logic in `src/lib/`
3. **Sync after example changes** — after editing `examples/next-app` run `pnpm sync:template`
4. **Version both files** — before publish bump `package.json` AND `src/index.ts` (`.version()`)
5. **No ^ or ~ in deps** — exact versions in CLI package and `PACKAGE_VERSIONS`

---

## Monorepo Structure

```
next-arch/
├── packages/
│   ├── next-arch/                    # CLI
│   │   ├── src/
│   │   │   ├── index.ts              # commander entry
│   │   │   ├── commands/
│   │   │   │   ├── init.ts           # project scaffolding
│   │   │   │   ├── generate.ts       # slice generation
│   │   │   │   ├── page.ts           # full page presets
│   │   │   │   └── doctor.ts         # FSD health check
│   │   │   └── lib/
│   │   │       ├── packages.ts       # PACKAGE_VERSIONS — exact, no ^
│   │   │       ├── init-prompts.ts   # @clack/prompts flow
│   │   │       ├── apply-packages.ts # merge deps + providers
│   │   │       ├── apply-project-type.ts
│   │   │       ├── generate-providers.ts
│   │   │       ├── template.ts       # {{Name}}/{{name}} placeholders
│   │   │       └── page-presets.ts
│   │   ├── templates/
│   │   │   ├── app/                  # synced from examples/next-app
│   │   │   ├── feature|view|widget|entity/
│   │   │   ├── pages/                # auth, crud, dashboard...
│   │   │   └── packages/             # optional deps (core + examples)
│   │   ├── tests/                    # vitest
│   │   ├── vendor/                   # eslint-plugin — DO NOT edit manually
│   │   └── scripts/
│   │       ├── sync-vendor.mjs       # auto on CLI build
│   │       └── sync-template.mjs     # pnpm sync:template
│   └── eslint-plugin-next-arch/
│       ├── src/rules/                # 4 rules
│       ├── src/utils/layers.ts
│       └── tests/rules.test.js
├── examples/next-app/
├── .changeset/
└── turbo.json
```

---

## FSD Architecture (reference app + generated projects)

### Layer hierarchy

```
app (5) → views (4) → widgets (3) → features (2) → entities (1) → shared (0)
```

Legacy: `components/` and `lib/` at `src/` root = shared (rank 0). **shadcn lives in `shared/ui/`.**

### Feature structure

```
features/<name>/
├── ui/ | model/ | api/ | lib/ | actions/ | queries/ | types/
└── index.ts      # ONLY public API
```

Generated projects get **one root `AGENTS.md`** — no per-slice AGENTS.md, no CLAUDE.md.

### Import rules

```ts
// ✅
import { X } from '@/features/payments'
import { Button } from '@/shared/ui'

// ❌ deep / cross-feature / server-in-client / upward
```

---

## CLI Development

| Command | File |
|---------|------|
| `init <name>` | `init.ts` — copy app template, project type, packages, providers |
| `generate <type> <name>` | `generate.ts` — feature/view/widget/entity; `page` delegates to page |
| `page <name>` | `page.ts` — presets: auth, crud, dashboard, profile, settings, blank |
| `doctor` | `doctor.ts` — FSD checks without ESLint |

**Flags:** `-y`, `--cwd`, `--force`, `--project-type full|standard|simple`, `--no-examples`

**Placeholders:** `{{Name}}` PascalCase, `{{name}}` kebab-case, `{{NAME}}` UPPER

**Prompts:** always `@clack/prompts`, never `console.log` for UX

**assertNextProject:** requires `package.json` + `src/` at `--cwd`

---

## ESLint Plugin Development

| Rule | Blocks |
|------|--------|
| `no-cross-feature-imports` | features/A → features/B |
| `no-deep-imports` | deep paths outside feature public API |
| `no-server-in-client` | server imports in `'use client'` |
| `no-upward-imports` | lower → upper layer |

Error messages must explain **how to fix**, not just what's wrong.

New rules: implement + tests in `tests/rules.test.js` + README + minor bump.

---

## Dependencies

CLI exact pins (current):

```
commander 13.1.0 | @clack/prompts 0.10.1 | fs-extra 11.3.5 | chalk 5.6.2
engines: { "node": ">=20" }
```

`PACKAGE_VERSIONS` in `packages.ts` — exact versions for init deps, no `^`.

---

## Release Process

```bash
pnpm build && pnpm test && pnpm lint
pnpm sync:template   # if examples/next-app changed
# bump package.json + src/index.ts version
# pnpm changeset / CHANGELOG
git tag v0.x.x
npm publish --access public --provenance   # from packages/next-arch
```

**Branches:** `master` = stable publish, feature branches for development.

---

## What NOT To Do

```
❌ Edit vendor/ manually
❌ Use ^ or ~ in dependency versions
❌ console.log for user interaction — use @clack/prompts
❌ Change public CLI API without major bump
❌ Add ESLint rules without tests
❌ Forget pnpm sync:template after example app changes
❌ Add per-slice AGENTS.md or CLAUDE.md to init template
❌ Put shadcn in components/ui — use shared/ui
```

---

## Checklist Before Commit

```
□ pnpm lint — 0 errors
□ pnpm build — success
□ pnpm test — all green
□ No ^ or ~ in touched versions
□ examples/next-app changed → pnpm sync:template
□ Publish → version in package.json AND src/index.ts
```

---

## Quick Reference

```bash
pnpm build
pnpm test
pnpm lint
pnpm sync:template
pnpm next-arch init my-app -y --project-type standard
pnpm next-arch g feature payments --cwd my-app
pnpm next-arch doctor --cwd my-app
```
