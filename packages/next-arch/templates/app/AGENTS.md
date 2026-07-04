# AGENTS.md — FSD rules for AI assistants

Stack: Next.js 16, React 19, Tailwind 4, TypeScript strict.  
Architecture: Feature-Sliced Design — enforced by `eslint-plugin-next-arch`.

## Layers (imports top → bottom only)

```
app → views → widgets → features → entities → shared
```

## Feature public API

Import features only via `@/features/<name>` (index.ts).  
Never import `@/features/<name>/ui/...` from outside the feature.

## Server vs client

- Server Actions live in `features/*/actions/` — do not import them in `'use client'` files.
- Pass actions to client components via props from Server Components.

## Generate slices

```bash
npx next-arch generate feature <name>
npx next-arch generate view <name>
npx next-arch page <name> --preset crud
npx next-arch doctor
```

## Project type

Depends on init: `full` (all layers), `standard` (no widgets), `simple` (features + shared only).
