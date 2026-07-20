---
name: package-scripts
description: Esposter pnpm script reference — packages/app scripts (lint, typecheck, test, format, dev, build) and the root scripts (test, coverage, depcruise:graph, outdated:dependencies). Apply whenever running or recommending package scripts.
---

# Package Scripts

`packages/app` scripts run from `packages/app/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## `packages/app`

| Command             | Runs                                                      | When to use                                     |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `pnpm lint`         | `TIMING=1 eslint --config eslint.light.config.js .`       | CI/check-only lint verification                 |
| `pnpm lint:fix`     | `TIMING=1 eslint --config eslint.light.config.js --fix .` | **Local lint verification** — use this directly |
| `pnpm lint:all`     | `TIMING=1 eslint .` (full config)                         | Full lint pass (slower)                         |
| `pnpm lint:all:fix` | `TIMING=1 eslint --fix .`                                 | Fix all lint errors (full pass)                 |
| `pnpm typecheck`    | `nuxt typecheck`                                          | TypeScript type checking                        |
| `pnpm test`         | `vitest` (watch mode)                                     | Run this package's tests in watch mode          |
| `pnpm format`       | `oxfmt`                                                   | Format code                                     |
| `pnpm format:check` | `oxfmt --check`                                           | Check formatting without writing                |
| `pnpm dev`          | `nuxt dev`                                                | Start dev server                                |
| `pnpm build`        | `nuxt build`                                              | Build for production                            |

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

On PR-bound work the suite runs **once on `develop` after the merge**, not on the feature branch — see the git skill's "Merge Then Verify". Run before declaring work done:

1. `pnpm typecheck`
2. `pnpm lint:fix` — **only for `packages/*` (non-app)**; skip when the change touches `packages/app` (slow), leave that to CI.
3. `pnpm test -u --run` — **only when actual code changed** (not for test-only or doc edits). `-u` refreshes snapshots, `--run` forces a single non-watch run.

Test-only changes: just run the affected test file(s) — no full `test -u --run` sweep needed.

## Key Rules

- **Lint locally** with `pnpm lint:fix` directly (packages only, not app) — never hand-edit to satisfy the linter. Reserve `pnpm lint`/`pnpm lint:all` for CI.
- **Windows tests run**: the old `spawn EPERM` config-startup crash is fixed via the minimal Vitest module allowlist in `packages/app/configuration/modules.ts`.
- **Long-running** (`dev`, `build`, `test`, `typecheck`): use `run_in_background: true` (2+ min).
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Use `pnpm exec <binary> <args>` or direct args (`pnpm test -u`).
