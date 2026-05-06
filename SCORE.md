# Esposter — Repository Score

> Last reviewed: 2026-05-06 · Overall: **81 / 100**

A well-engineered, TypeScript-strict monorepo with strong architectural discipline and comprehensive linting. Primary drags are a growing set of beta/RC production dependencies (including the core ORM), no CI caching, and a large unoptimised bundle footprint.

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

174 test files across the monorepo (app: 149, shared: 20, db-schema: 5). Commands, pure services, and shared utilities are well covered. 7 benchmark files for table editor hot paths. PGlite used for in-memory PostgreSQL in server tests — no real DB required. Canonical test value conventions enforced.

**Remaining gaps:** `packages/azure-functions` has zero test files — all webhook handlers are untested. Pinia store unit tests remain sparse. No coverage thresholds enforced (coverage artifact uploaded but thresholds not configured in vitest or CI).

---

## Security — 7 / 10

Zod `.safeParse()` on all tRPC inputs and webhook handlers. `better-auth` v1.6.9 with Drizzle adapter and OAuth (Facebook, GitHub, Google). Drizzle ORM parameterized queries prevent SQL injection. Custom rate limiter uses `RateLimiterDrizzleNonAtomic` (1000 pts / 60 s window, 60 s block) — note the **NonAtomic** implementation is susceptible to race conditions under burst concurrency.

**Accepted trade-offs / open gaps:**

- `unsafe-eval` in CSP — required by Desmos, unavoidable
- `unsafe-inline` — required by Vuetify style injection and Nuxt hydration
- `xssValidator: false` — disabled pending tRPC-Nuxt #215 resolution
- CSRF not explicitly configured — relying on `nuxt-security` defaults; tRPC's JSON content-type blocks HTML-form CSRF but not fetch-based attacks under permissive CORS

---

## Dependencies — 5 / 10

Catalog-driven versioning via `pnpm-workspace.yaml` with `catalogMode: strict` prevents version drift. Core tools pinned. `better-auth` 1.6.9, Nuxt 4.4.4 on stable releases. Phaser 4 no longer flagged as RC.

**9 pre-release packages in production paths:**

| Package               | Version       | Role                                |
| --------------------- | ------------- | ----------------------------------- |
| `drizzle-orm`         | 1.0.0-beta.23 | **Core ORM — all DB access**        |
| `drizzle-kit`         | 1.0.0-beta.23 | **Migrations toolchain**            |
| `vuetify-nuxt-module` | ^1.0.0-beta.3 | Primary UI integration              |
| `rolldown`            | ^1.0.0-rc.18  | Build toolchain for shared packages |
| `unplugin-dts`        | 1.0.0-beta.6  | Type declaration build step         |
| `survey-core`         | 3.0.0-beta.0  | Survey feature                      |
| `survey-creator-core` | 3.0.0-beta.0  | Survey feature                      |
| `survey-creator-vue`  | 3.0.0-beta.0  | Survey feature                      |
| `survey-vue3-ui`      | 3.0.0-beta.0  | Survey feature                      |

Drizzle ORM and drizzle-kit moving to the 1.0.0-beta series is a significant regression from the previously stable 0.x line — all database access and every migration goes through these packages.

---

## CI / CD — 6 / 10

Four workflows: CI (all branches), Release (tags), and two Azure Functions deployment pipelines (develop → dev slot, main → prod slot). Full CI pipeline: install → build → lint → format check → typecheck → test → coverage upload.

**Gaps:**

- No pnpm or node_modules caching configured — every CI run reinstalls all dependencies from scratch
- All CI steps run sequentially in a single job — lint, typecheck, and test cannot parallelise
- No coverage thresholds enforced (`if-no-files-found: error` uploads the artifact, but no minimum % gate)

---

## Bundle & Performance — 5 / 10

`assetsInlineLimit: 0` prevents Phaser data URI breakage. Server-only transpilation for `@vue-pdf-viewer` and `pdfjs-dist`. 7 benchmark files cover table editor hot paths. `nuxt analyze` script available.

**Concerns:**

- No explicit route-level or component-level code splitting configured
- Heavy dependency footprint — Phaser, GrapesJS, Survey (4 packages), Three.js, FullCalendar, pdf-viewer — no evidence these are chunked out of the main bundle
- No bundle size budgets enforced
- `pnpm analyze` available but no evidence of regular use or tracked baselines

---

## Summary

| Area                 | Score      | Notes                                                         |
| -------------------- | ---------- | ------------------------------------------------------------- |
| Architecture         | 20 / 20    | 11 packages, clean DAG, data-driven maps, command pattern     |
| TypeScript           | 15 / 15    | Maximum strictness; `skipLibCheck` only trade-off             |
| Code Quality         | 15 / 15    | Guard clauses, `InvalidOperationError`, clean patterns        |
| Testing              | 8 / 10     | Azure Functions untested; no coverage thresholds enforced     |
| Security             | 7 / 10     | NonAtomic rate limiter; CSRF not configured; xssValidator off |
| Dependencies         | 5 / 10     | 9 pre-release packages — Drizzle ORM/Kit now on beta series   |
| CI / CD              | 6 / 10     | No caching; sequential jobs; no coverage thresholds           |
| Bundle & Performance | 5 / 10     | No chunk splitting; large footprint; no size budgets          |
| **Total**            | **81/100** |                                                               |
