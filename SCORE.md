# Esposter — Repository Score

> Last reviewed: 2026-06-13 · Nuxt `compatibilityDate`: `2026-06-13` · Overall: **93 / 100**

A well-engineered, TypeScript-strict monorepo with strong architectural discipline and comprehensive linting. The approach deliberately delegates heavy lifting to well-maintained libraries (Vite, nuxt-security, pnpm actions, Drizzle) rather than rolling custom solutions. Primary remaining drag is the set of pre-release production dependencies.

---

## Architecture & Organisation — 20 / 20

12 packages with clear responsibilities and a sensible dependency DAG (`shared` has no Vue deps, `db-schema` has no server deps, etc.). Data-driven map pattern (`*TypeColorMap`, `*TypeCommandMap`, `ColumnStatDefinitionMap`, etc.) enforces single-entry extension. Command pattern for undo/redo is well-scoped. ~32 tRPC routers, 107 Pinia store files across 13 modules. Barrel files managed by ctix — no accidental re-export drift.

---

## TypeScript — 10 / 10

`isolatedDeclarations: true`, `verbatimModuleSyntax: true`, `allowJs: false`; Nuxt 4 auto-generates a strict-mode tsconfig. Zod schemas co-located with models, `satisfies z.ZodType<T>` enforced, no raw `any` or `Omit`. `takeOne()` used consistently in place of direct index access.

> `skipLibCheck: true` — acceptable trade-off for build speed.

---

## Code Quality & Patterns — 10 / 10

Guard clauses over nested conditionals throughout. `InvalidOperationError` for impossible states — no silent fallbacks. `structuredClone(toRawDeep(...))` snapshot/restore for optimistic updates is consistent. Zod form schemas separated from entity schemas (via `.pick().extend()`) to keep class instances away from vjsf. `eslint-plugin-depend` active and configured with an explicit allowlist.

---

## Testing — 10 / 10

255 test files across the monorepo (app: 160, shared: 25, azure-functions: 17, vue-phaserjs: 16, parse-tmx: 11, db: 8, db-schema: 8, azure-mock: 5, db-mock: 2, infra/xml2js/configuration: 1 each). Commands, pure services, and shared utilities are well covered. 7 benchmark files for table editor hot paths. PGlite used for in-memory PostgreSQL in server tests — no real DB required. Canonical test value conventions enforced. Full type-safety across the board reduces the need for coverage thresholds as a quality gate.

`packages/azure-functions` logic now lives in extracted `handlers/` (e.g. `processPushNotificationHandler`, `processWebhookHandler`, `processFriendRequestNotificationHandler`) which are unit-tested directly — 17 test files — leaving only the thin `app.eventGrid(...)` registration glue untested.

**Accepted trade-off:**

- Pinia store unit tests cover all stores with real business logic (tableEditor undo/redo, message emoji/input/slash command/call). The remaining untested stores are Phaser game-engine state (dungeons, clicker) that cannot be meaningfully exercised outside the canvas runtime, or thin CRUD holders with no logic to assert.

---

## Security — 8 / 10

Zod `.safeParse()` on all tRPC inputs and webhook handlers. `better-auth` v1.6.18 with Drizzle adapter and OAuth (Facebook, GitHub, Google). Drizzle ORM parameterized queries prevent SQL injection. Tiered rate limiting via `RateLimiterDrizzleNonAtomic` (`standard` 1000 pts, `slow` 100 pts, plus a dedicated `webhook` limiter — all 60 s window / 60 s block) — NonAtomic is a deliberate choice for performance given rate limiting is not a hard security boundary here. `nuxt-security`'s own `rateLimiter` is disabled in favour of these app-level limiters. CSRF protection handled by `nuxt-security` defaults; tRPC's JSON content-type provides additional mitigation.

**Accepted trade-offs:**

- `unsafe-eval` in CSP — required by Desmos, unavoidable
- `unsafe-inline` — required by Vuetify style injection and Nuxt hydration
- `xssValidator: false` — disabled pending tRPC-Nuxt #215 resolution

---

## Dependencies — 8 / 10

Catalog-driven versioning via `pnpm-workspace.yaml` with `catalogMode: strict` prevents version drift. `better-auth` 1.6.18, Nuxt 4.4.8, Phaser 4.1.0, `rolldown` (`^1.1.1`) and `unplugin-dts` (`^1.0.2`) all on stable releases. Drizzle is on RC (`1.0.0-rc.2`) — the v1 API is stable in practice, schema/query migration complete. TypeScript on v6 (`^6.0.3`). Only `h3` remains pinned (held below its v2 RC); `@vue/language-core`/`vue-tsc` are back on caret ranges (`^3.3.5`).

**7 pre-release packages in production paths:**

| Package               | Version       | Role                     |
| --------------------- | ------------- | ------------------------ |
| `drizzle-orm`         | 1.0.0-rc.2    | Core ORM — all DB access |
| `drizzle-kit`         | 1.0.0-rc.2    | Migrations toolchain     |
| `vuetify-nuxt-module` | ^1.0.0-beta.8 | Primary UI integration   |
| `survey-core`         | 3.0.0-beta.0  | Survey feature           |
| `survey-creator-core` | 3.0.0-beta.0  | Survey feature           |
| `survey-creator-vue`  | 3.0.0-beta.0  | Survey feature           |
| `survey-vue3-ui`      | 3.0.0-beta.0  | Survey feature           |

`eslint-plugin-depend` is configured and will surface new issues here over time.

---

## Styling — 9 / 10

UnoCSS `presetAttributify` + `presetWind4` enforced project-wide: all static styles as element attributes, `class` reserved for dynamic bindings, scoped CSS refs, and third-party selectors. Vuetify theme colors bridged via CSS custom properties (`rgb(var(--v-theme-...))`) and baked into UnoCSS theme + safelist — single source of truth for design tokens. CSS cascade managed via `outputToCssLayers`. Custom elevation (MD3) and typography shortcuts via `unocss-preset-vuetify`. Dark mode wired through `.v-theme--dark`/`.v-theme--light` class selectors, avoiding media-query conflicts with Vuetify.

**Accepted trade-offs:**

- Safelist enumerates all color × variation keys — CSS weight growth is low-risk given the finite set of Vuetify theme token combinations in use.
- No automated visual regression testing (Storybook / Chromatic or Playwright snapshots) — the seeding layer (real-time messages, Azure Table, WebPubSub, env-gated features) makes generic snapshot coverage impractical until the UI stabilises. Visual drift caught by manual review.

---

## CI / CD — 10 / 10

Five workflows: CI (all branches), Pulumi (infra preview on PRs), Release (tags), and two Azure Functions deployment pipelines (develop → dev slot, main → prod slot). CI runs all checks as fully independent parallel jobs with no inter-job gate: `build`, `coverage`, `build-docs`, `lint`, and `typecheck` each restore compiled package output (`dist` + generated `src/**/index.ts` barrels) from an `actions/cache` via the shared `setup-packages` composite, rebuilding only on a cache miss; `format` runs with no package dependency. The previous serial `build-packages` artifact gate was removed — the common app-only commit hits the cache and every check starts at t=0, trading redundant parallel rebuilds on package-change commits for a shorter critical path. Coverage is uploaded as an artifact. pnpm store caching is handled by the shared `setup-project-dependencies` composite action.

Security hardening throughout: every third-party action is SHA-pinned (`actions/checkout`, `actions/cache`, `actions/setup-node`, `upload-artifact`), `persist-credentials: false` on all checkouts, and explicit least-privilege `permissions:` on the jobs that need them.

---

## Bundle & Performance — 8 / 10

`assetsInlineLimit: 0` prevents Phaser data URI breakage. Server-only transpilation for `@vue-pdf-viewer` and `pdfjs-dist`. 7 benchmark files cover table editor hot paths. `nuxt analyze` script available. Code splitting is handled automatically by Vite — no manual chunk configuration required.

**Accepted trade-offs:**

- Large dependency footprint — Phaser, GrapesJS, Survey (4 packages), Three.js, FullCalendar, pdf-viewer. Total output is ~65 MB, which is reasonable for the feature surface. Nuxt build output surfaces size on every build, providing a visible baseline; no automated budget enforcement, but regressions are observable.

---

## Summary

| Area                 | Score        | Notes                                                                            |
| -------------------- | ------------ | -------------------------------------------------------------------------------- |
| Architecture         | 20 / 20      | 12 packages, clean DAG, data-driven maps, command pattern                        |
| TypeScript           | 10 / 10      | Maximum strictness; `skipLibCheck` only trade-off                                |
| Code Quality         | 10 / 10      | Guard clauses, `InvalidOperationError`, clean patterns                           |
| Testing              | 10 / 10      | 255 test files; handlers extracted + tested; only Phaser store gaps remain       |
| Security             | 8 / 10       | CSP trade-offs documented; xssValidator pending upstream                         |
| Dependencies         | 8 / 10       | 7 pre-release packages (Drizzle RC, Survey betas); TypeScript v6                 |
| Styling              | 9 / 10       | Attributify enforced; Vuetify token bridge; visual regression accepted trade-off |
| CI / CD              | 10 / 10      | Fully-parallel cached jobs; SHA-pinned actions; least-privilege; Pulumi preview  |
| Bundle & Performance | 8 / 10       | Vite auto-splits; ~65 MB known footprint; Nuxt build provides visible baseline   |
| **Total**            | **93 / 100** |                                                                                  |
