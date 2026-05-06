# Esposter — Repository Score

> Last reviewed: 2026-05-06 · Overall: **87 / 100**

A well-engineered, TypeScript-strict monorepo with strong architectural discipline and comprehensive linting. The approach deliberately delegates heavy lifting to well-maintained libraries (Vite, nuxt-security, pnpm actions, Drizzle) rather than rolling custom solutions. Primary remaining drag is the set of pre-release production dependencies.

---

## Architecture & Organisation — 20 / 20

11 packages with clear responsibilities and a sensible dependency DAG (`shared` has no Vue deps, `db-schema` has no server deps, etc.). Data-driven map pattern (`*TypeColorMap`, `*TypeCommandMap`, `ColumnStatDefinitionMap`, etc.) enforces single-entry extension. Command pattern for undo/redo is well-scoped. 24 tRPC routers, 109 Pinia store files across 13 modules. Barrel files managed by ctix — no accidental re-export drift.

---

## TypeScript — 15 / 15

`isolatedDeclarations: true`, `verbatimModuleSyntax: true`, `allowJs: false`; Nuxt 4 auto-generates a strict-mode tsconfig. Zod schemas co-located with models, `satisfies z.ZodType<T>` enforced, no raw `any` or `Omit`. `takeOne()` used consistently in place of direct index access.

> `skipLibCheck: true` — acceptable trade-off for build speed.

---

## Code Quality & Patterns — 15 / 15

Guard clauses over nested conditionals throughout. `InvalidOperationError` for impossible states — no silent fallbacks. `structuredClone(toRawDeep(...))` snapshot/restore for optimistic updates is consistent. Zod form schemas separated from entity schemas (via `.pick().extend()`) to keep class instances away from vjsf. `eslint-plugin-depend` active and configured with an explicit allowlist.

---

## Testing — 8 / 10

174 test files across the monorepo (app: 149, shared: 20, db-schema: 5). Commands, pure services, and shared utilities are well covered. 7 benchmark files for table editor hot paths. PGlite used for in-memory PostgreSQL in server tests — no real DB required. Canonical test value conventions enforced. Full type-safety across the board reduces the need for coverage thresholds as a quality gate.

**Remaining gaps:** `packages/azure-functions` has zero test files — all webhook handlers are untested. Pinia store unit tests remain sparse.

---

## Security — 8 / 10

Zod `.safeParse()` on all tRPC inputs and webhook handlers. `better-auth` v1.6.9 with Drizzle adapter and OAuth (Facebook, GitHub, Google). Drizzle ORM parameterized queries prevent SQL injection. Rate limiting via `RateLimiterDrizzleNonAtomic` (1000 pts / 60 s window, 60 s block) — NonAtomic is a deliberate choice for performance given rate limiting is not a hard security boundary here. CSRF protection handled by `nuxt-security` defaults; tRPC's JSON content-type provides additional mitigation.

**Accepted trade-offs:**

- `unsafe-eval` in CSP — required by Desmos, unavoidable
- `unsafe-inline` — required by Vuetify style injection and Nuxt hydration
- `xssValidator: false` — disabled pending tRPC-Nuxt #215 resolution

---

## Dependencies — 6 / 10

Catalog-driven versioning via `pnpm-workspace.yaml` with `catalogMode: strict` prevents version drift. Core tools pinned. `better-auth` 1.6.9, Nuxt 4.4.4, Phaser 4 all on stable releases. Drizzle's move to the 1.0.0-beta series represents forward progress — the v1 API is significantly improved, the migration was completed in full, and the heavy lifting of schema/query refactoring is behind us.

**9 pre-release packages in production paths:**

| Package               | Version       | Role                                |
| --------------------- | ------------- | ----------------------------------- |
| `drizzle-orm`         | 1.0.0-beta.23 | Core ORM — all DB access            |
| `drizzle-kit`         | 1.0.0-beta.23 | Migrations toolchain                |
| `vuetify-nuxt-module` | ^1.0.0-beta.3 | Primary UI integration              |
| `rolldown`            | ^1.0.0-rc.18  | Build toolchain for shared packages |
| `unplugin-dts`        | 1.0.0-beta.6  | Type declaration build step         |
| `survey-core`         | 3.0.0-beta.0  | Survey feature                      |
| `survey-creator-core` | 3.0.0-beta.0  | Survey feature                      |
| `survey-creator-vue`  | 3.0.0-beta.0  | Survey feature                      |
| `survey-vue3-ui`      | 3.0.0-beta.0  | Survey feature                      |

`eslint-plugin-depend` is configured and will surface new issues here over time.

---

## CI / CD — 8 / 10

Four workflows: CI (all branches), Release (tags), and two Azure Functions deployment pipelines (develop → dev slot, main → prod slot). Full CI pipeline: install → build → lint → format check → typecheck → test → coverage upload. Dependency caching is handled automatically by the pnpm actions setup — no manual cache configuration needed.

**Remaining gap:** All CI steps run sequentially in a single job — lint, typecheck, and test cannot parallelise, which adds unnecessary wall-clock time for a monorepo of this size.

---

## Bundle & Performance — 7 / 10

`assetsInlineLimit: 0` prevents Phaser data URI breakage. Server-only transpilation for `@vue-pdf-viewer` and `pdfjs-dist`. 7 benchmark files cover table editor hot paths. `nuxt analyze` script available. Code splitting is handled automatically by Vite — no manual chunk configuration required.

**Remaining concern:** Large dependency footprint — Phaser, GrapesJS, Survey (4 packages), Three.js, FullCalendar, pdf-viewer. No bundle size budgets or tracked baselines to catch regressions.

---

## Summary

| Area                 | Score      | Notes                                                     |
| -------------------- | ---------- | --------------------------------------------------------- |
| Architecture         | 20 / 20    | 11 packages, clean DAG, data-driven maps, command pattern |
| TypeScript           | 15 / 15    | Maximum strictness; `skipLibCheck` only trade-off         |
| Code Quality         | 15 / 15    | Guard clauses, `InvalidOperationError`, clean patterns    |
| Testing              | 8 / 10     | Azure Functions untested; sparse store unit tests         |
| Security             | 8 / 10     | CSP trade-offs documented; xssValidator pending upstream  |
| Dependencies         | 6 / 10     | 9 pre-release packages; Drizzle v1 migration complete     |
| CI / CD              | 8 / 10     | Sequential jobs; caching and thresholds handled           |
| Bundle & Performance | 7 / 10     | Vite auto-splits; large footprint; no size budgets        |
| **Total**            | **87/100** |                                                           |
