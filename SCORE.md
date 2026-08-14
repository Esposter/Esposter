# Esposter — Repository Score

> Last reviewed: 2026-07-15 · Nuxt `compatibilityDate`: `2026-07-15` · Overall: **93 / 100**

| Area                 | Score   | Notes                                                                      |
| -------------------- | ------- | -------------------------------------------------------------------------- |
| Architecture         | 20 / 20 | 14 packages, clean DAG, data-driven maps, command pattern                  |
| TypeScript           | 10 / 10 | Maximum strictness; `skipLibCheck` only trade-off                          |
| Code Quality         | 10 / 10 | Guard clauses, `InvalidOperationError`, `neverthrow` over `try`/`catch`    |
| Testing              | 10 / 10 | Several hundred test files; only Phaser store gaps remain                  |
| Security             | 8 / 10  | CSP trade-offs documented; `xssValidator` pending upstream                 |
| Dependencies         | 8 / 10  | A few pre-release packages (Drizzle RC, Survey betas)                      |
| Styling              | 9 / 10  | Attributify enforced; Vuetify token bridge; no visual regression tests     |
| CI / CD              | 10 / 10 | Cached reusable build; SHA-pinned actions; least-privilege; Pulumi preview |
| Bundle & Performance | 8 / 10  | Vite auto-splits; ~65 MB known footprint; no automated budget              |

A TypeScript-strict monorepo with strong architectural discipline and comprehensive linting, deliberately delegating heavy lifting to well-maintained libraries (Vite, nuxt-security, Drizzle) over custom solutions. Primary remaining drag is the set of pre-release production dependencies.

---

## Architecture & Organisation — 20 / 20

14 packages with clear responsibilities and a sensible dependency DAG (`shared` has no Vue deps, `db-schema` has no server deps). Data-driven map pattern (`*TypeColorMap`, `ColumnStatDefinitionMap`) enforces single-entry extension. Command pattern for undo/redo is well-scoped. Dozens of tRPC routers and well over a hundred Pinia store files, split across a dozen feature modules. Barrel files managed by ctix — no accidental re-export drift.

## TypeScript — 10 / 10

`isolatedDeclarations`, `verbatimModuleSyntax`, `allowJs: false`; Nuxt auto-generates a strict-mode tsconfig. Zod schemas co-located with models, `satisfies z.ZodType<T>` enforced, no raw `any` or `Omit`. `takeOne()` replaces direct index access under `noUncheckedIndexedAccess`. The `void` operator is banned via `no-void`, with `getSynchronizedFunction` as the single sanctioned escape hatch.

> `skipLibCheck: true` — accepted trade-off for build speed.

## Code Quality & Patterns — 10 / 10

Guard clauses over nested conditionals. `InvalidOperationError` for impossible states — no silent fallbacks. `try`/`catch` is banned in favour of `neverthrow` `getResult`/`getResultAsync`. `structuredClone(toRawDeep(...))` snapshot/restore for optimistic updates is consistent. Zod form schemas separated from entity schemas to keep class instances away from vjsf. `eslint-plugin-depend` active with an explicit allowlist.

## Testing — 10 / 10

Several hundred test files, concentrated in `app` and `virrun` but present in every package that holds logic. Benchmarks cover the sheet editor hot paths. PGlite provides in-memory PostgreSQL for server tests — no real DB required. Azure Functions logic lives in extracted, directly-tested `handlers/`, leaving only thin `app.eventGrid(...)` registration glue uncovered.

**Accepted trade-off:** untested Pinia stores are Phaser game-engine state (dungeons, clicker) that cannot be meaningfully exercised outside the canvas runtime, or thin CRUD holders with no logic to assert.

## Security — 8 / 10

Zod `.safeParse()` on all tRPC inputs and webhook handlers. `better-auth` with Drizzle adapter and OAuth (Facebook, GitHub, Google). Drizzle parameterized queries prevent SQL injection. Tiered rate limiting via `RateLimiterDrizzleNonAtomic` — NonAtomic is deliberate, as rate limiting is not a hard security boundary here; `nuxt-security`'s own `rateLimiter` is disabled in favour of these app-level limiters.

**Accepted trade-offs:**

- `unsafe-eval` in CSP — required by Desmos, unavoidable
- `unsafe-inline` — required by Vuetify style injection and Nuxt hydration
- `xssValidator: false` — disabled pending tRPC-Nuxt #215

## Dependencies — 8 / 10

Catalog-driven versioning via `pnpm-workspace.yaml` with `catalogMode: strict` prevents drift. Nuxt 4.4.8, Vuetify 4.1.5, Phaser 4.2.1, TypeScript 6, `rolldown` and `unplugin-dts` all stable. `h3` is held at v1 via a pnpm override, below its v2 line. Drizzle is on RC — the v1 API is stable in practice and the schema/query migration is complete.

**7 pre-release packages in production paths:**

| Package                           | Version       | Role                   |
| --------------------------------- | ------------- | ---------------------- |
| `drizzle-orm` / `drizzle-kit`     | 1.0.0-rc.2    | Core ORM + migrations  |
| `vuetify-nuxt-module`             | ^1.0.0-rc.2   | Primary UI integration |
| `survey-core` / `-creator-core`   | ^3.0.0-beta.8 | Survey feature         |
| `survey-creator-vue` / `-vue3-ui` | ^3.0.0-beta.8 | Survey feature         |

## Styling — 9 / 10

UnoCSS `presetAttributify` + `presetWind4` project-wide: static styles as element attributes, `class` reserved for dynamic bindings. Vuetify theme colors bridged via CSS custom properties and baked into the UnoCSS theme + safelist — a single source of truth for design tokens. Cascade managed via `outputToCssLayers`. Dark mode wired through `.v-theme--dark`/`.v-theme--light` selectors, avoiding media-query conflicts with Vuetify.

**Accepted trade-off:** no automated visual regression testing — the seeding layer (real-time messages, Azure Table, WebPubSub, env-gated features) makes generic snapshot coverage impractical until the UI stabilises. Visual drift is caught by manual review.

## CI / CD — 10 / 10

Nine workflows: CI, Bench, Release (tags), Pulumi (infra preview on PRs), Delete Merged Branch, Claude warmup, a reusable build, and two Azure Functions deployments (develop → dev slot, main → prod slot).

CI builds every non-app package once via the reusable `build-packages` workflow, which every downstream job (`build`, `build-docs`, `coverage`, `format`, `lint`, `typecheck`) gates on. Its `actions/cache` entry is keyed by content hash and shared repo-wide, so a CI build gives Bench a cache hit for free, and vice versa — the common app-only commit skips the build entirely. Tests run through one root `vitest.config.ts` `projects` config, so coverage runs as a `--shard` matrix with `--reporter=blob`, feeding a dependent `coverage-merge` job that recombines the blobs into one artifact.

Security hardening throughout: every third-party action is SHA-pinned, `persist-credentials: false` on all checkouts, and explicit least-privilege `permissions:`.

## Bundle & Performance — 8 / 10

`assetsInlineLimit: 0` prevents Phaser data URI breakage. Server-only transpilation for `@vue-pdf-viewer` and `pdfjs-dist`. `nuxt analyze` available. Code splitting is handled automatically by Vite.

**Accepted trade-off:** large dependency footprint (Phaser, GrapesJS, Survey, Three.js, FullCalendar, pdf-viewer) totalling ~65 MB, reasonable for the feature surface. Nuxt build output surfaces size on every build, so regressions stay observable without an enforced budget.
