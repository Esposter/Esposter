---
name: package-scripts
description: Esposter pnpm script reference — packages/app scripts (lint, typecheck, test, format, dev, build) and the root scripts (test, coverage, depcruise:graph, outdated:dependencies). Apply whenever running or recommending package scripts.
---

# Package Scripts

`packages/app` scripts run from `packages/app/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## `packages/app`

| Command             | Runs                  | When to use                                     |
| ------------------- | --------------------- | ----------------------------------------------- |
| `pnpm lint`         | `eslint .`            | CI/check-only lint verification                 |
| `pnpm lint:fix`     | `eslint --fix .`      | **Local lint verification** — use this directly |
| `pnpm typecheck`    | `nuxt typecheck`      | TypeScript type checking                        |
| `pnpm test`         | `vitest` (watch mode) | Run this package's tests in watch mode          |
| `pnpm format`       | `oxfmt`               | Format code                                     |
| `pnpm format:check` | `oxfmt --check`       | Check formatting without writing                |
| `pnpm dev`          | `nuxt dev`            | Start dev server                                |
| `pnpm build`        | `nuxt build`          | Build for production                            |

> Oxlint is **not** part of any package's `lint` script — it runs as a single repo-wide pass from the **root** `pnpm lint` / `pnpm lint:fix` (one `.oxlintrc.json` at the repo root). Packages run ESLint only.

## Root Scripts

| Command                      | Runs                                              | Notes                                                                                                                              |
| ---------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`                     | —                                                 | Refresh deps/lockfile after manifest changes.                                                                                      |
| `pnpm test`                  | `virrun -- vitest run`                            | Whole suite once via unified root vitest `projects` config (all packages + scripts).                                               |
| `pnpm test:packages`         | `virrun -- vitest run --project "!@esposter/app"` | All projects except the app — fast local run, skips Nuxt. Local-only.                                                              |
| `pnpm coverage`              | `vitest run --coverage` (no virrun)               | Root-only (packages have no `coverage` script). CI shards via `--reporter=blob` + `--merge-reports`.                               |
| `pnpm outdated:dependencies` | `tsx scripts/checkDependencies/index.ts`          | Checks manifests use `catalog:`/`workspace:`, and catalog/configDependency/`engines` specifiers against the lockfile + npm latest. |
| `pnpm depcruise:graph`       | `virrun -- depcruise … \| graphviz -Tsvg`         | Generate `dependency-graph.svg`.                                                                                                   |

## Check Suite (after edits)

The suite runs **once per coherent chunk, on `develop`, before that chunk is pushed** — not per commit — see the git skill's "Verify On `develop`". Run before declaring work done:

1. `pnpm typecheck`
2. Lint fix — `pnpm lint:fix` from `packages/app/` for app changes (ESLint only; app oxlint coverage comes from CI's root `pnpm lint`); `pnpm lint:fix:packages` from the root for non-app `packages/*` changes.
3. `pnpm test -u --run` — **only when actual code changed** (not for test-only or doc edits). `-u` refreshes snapshots, `--run` forces a single non-watch run.

Test-only changes: just run the affected test file(s) — no full `test -u --run` sweep needed.

## Key Rules

- **Lint locally** with the fix scripts — never hand-edit to satisfy the linter. Reserve the check-only `pnpm lint` for CI.
- **Windows tests run**: the old `spawn EPERM` config-startup crash is fixed via the minimal Vitest module allowlist in `packages/app/configuration/modules.ts`.
- **Long-running** (`dev`, `build`, `test`, `typecheck`): use `run_in_background: true` (2+ min).
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Use `pnpm exec <binary> <args>` or direct args (`pnpm test -u`).
