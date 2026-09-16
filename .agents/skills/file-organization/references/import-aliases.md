# Import aliases

Read when choosing an import specifier, when the alias ban fires on one, or when a composable import looks necessary. The rule itself — alias imports, never relative, and never a composable — is in `SKILL.md`; this page is the map of which alias reaches what, the enforcement's exemptions, and the two composable imports that still need a specifier.

## The app's aliases

- `#shared/` — the app's shared directory (`apps/web/shared/`, **not** a `shared/` folder under `app/`); models, services, constants shared between client and server.
- `@@/` — project root (`apps/web/`); `server/` and other root-level paths.
- `@/` — app source directory (`apps/web/app/`); `composables/`, `components/`, `store/`, `services/`, etc.
- Never use `~~/` (old Nuxt alias) — replace with `@@/`.
- Those are the **app's** aliases and Nuxt generates them. Everywhere else — every `packages/*` and the repo-root `scripts/` — a tree addresses its own source through the `#src/*` subpath imports its manifest declares, and oxlint bans `@/` there (`build` skill).

## How the ban is enforced

Enforced by oxlint `no-restricted-imports` for `packages/*/src/**` and the repo-root `scripts/src/**` (the `#src/*` half), each against the map its own manifest declares. Two things are exempt, sharing one override because the alias ban still applies to both: the ctix-generated `src/index.ts` barrel, which is not hand-written, and `.agents/**`, which is the one tree with no `imports` map to point at. `packages/configuration` is **not** exempt — it declares `#src/*` like every other package, its root `tsdown.config.ts` and `vitest.config.ts` included, and the bootstrap survives it because Node resolves the map to a `.ts` target it can already type-strip. Reaching up out of a package is the one exception anywhere, since no `#` map or package export points past its own root: the repo-root `package.json`, where both sites carry an `oxlint-disable-next-line` saying so, and the app's generated `.nuxt/eslint.config.mjs`, which Nuxt writes at prepare time and which both `packages/configuration/eslint/index.*.js` entry configs import by relative path — `eslint/` is outside `src/`, so the rule never reaches them and they carry no directive.

## The two composable imports that stay

A **type** exported beside a composable (`PaginationCacheOptions`, `OnlineSubscribableContext`), which the auto-import does not carry, and a `*.test.ts` / `*.bench.ts` helper living under `composables/`, which the scan skips.
