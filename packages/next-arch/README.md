# @yousxlfs/next-arch

CLI for Next.js App Router with strict [Feature-Sliced Design](https://feature-sliced.design/) — scaffolds projects, generates slices, and ships with `eslint-plugin-next-arch` bundled.

I built this because Next.js has no fixed folder structure. AI and juniors keep breaking imports (`features/cart` → `features/auth`). This tool creates the layout once and ESLint enforces it.

**Full docs:** [github.com/angeloscode/next-arch](https://github.com/angeloscode/next-arch)

## Install

```bash
npx @yousxlfs/next-arch init my-app
cd my-app
pnpm install
pnpm dev
```

Node 20+.

## What you get after `init`

- FSD folders: `app/`, `views/`, `widgets/`, `features/`, `entities/`, `shared/`
- `eslint-plugin-next-arch` in `vendor/` + ESLint config
- Root `AGENTS.md` for Cursor / Copilot
- TanStack Query, providers (based on your init choices)
- Optional commented examples in `src/features/_examples/`

## Layers

Imports only **down**:

```
app → views → widgets → features → entities → shared
```

Outside a feature: import only `@/features/cart`, never `@/features/cart/ui/...`.

## Commands

```bash
# new project
next-arch init my-app
next-arch init my-app -y --no-examples --project-type simple

# add a slice
next-arch generate feature payments
next-arch g view dashboard
next-arch generate widget header
next-arch generate entity user

# full page with preset
next-arch page orders --preset crud

# architecture check (no full eslint run)
next-arch doctor

# remove a slice
next-arch remove feature payments
next-arch remove view dashboard
next-arch rm entity user
next-arch remove feature payments --force
```

### Useful flags

| Flag | Description |
|------|-------------|
| `--output-dir <path>` | Parent folder for the new project |
| `--project-type full\|standard\|simple` | How many FSD layers to keep |
| `--cwd <path>` | Project root (generate / page / doctor / remove) |
| `-y` | Skip prompts |
| `-f` | Force overwrite or skip remove confirmation |
| `--no-examples` | Skip `_examples/` |

| Command | Description |
|---------|-------------|
| `remove <type> <name>` | Remove a FSD slice; warns which files still import it |
| `rm <type> <name>` | Alias for `remove` |

### `remove` — safe slice deletion

```bash
next-arch remove feature payments       # asks for confirmation
next-arch rm widget sidebar -f          # delete immediately
```

Output when other files depend on the slice:

```
▲  Found 2 file(s) importing from @/features/payments:
●    src/views/Checkout.tsx
●    src/widgets/cart/ui/Summary.tsx
●  These imports will break after removal.
◇  Will remove: features/payments/ (9 files)
```

Types: `feature`, `view`, `widget`, `entity`. Does not auto-fix imports — only warns.

### Page presets

`auth`, `crud`, `dashboard`, `profile`, `settings`, `blank`

## ESLint plugin

Every generated project includes `eslint-plugin-next-arch`. Standalone install:

```bash
pnpm add -D eslint-plugin-next-arch
```

## Issues

[github.com/angeloscode/next-arch/issues](https://github.com/angeloscode/next-arch/issues)

MIT © [angeloscode](https://github.com/angeloscode)
