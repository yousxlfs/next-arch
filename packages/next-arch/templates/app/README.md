# next-arch example app

Reference Next.js 16 app with Feature-Sliced Design (FSD).

## Structure

```
src/
├── app/          routes, layout, providers
├── views/        page compositions
├── widgets/      site-header (full project type)
├── features/     demo feature with api + queries + ui
├── entities/     user entity (full project type)
└── shared/       ui kit, lib, providers
```

## Commands

```bash
pnpm dev
pnpm lint
pnpm arch generate feature payments
pnpm arch doctor
```

See [AGENTS.md](./AGENTS.md) for FSD import rules.
