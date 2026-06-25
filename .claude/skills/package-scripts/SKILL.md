---
name: package-scripts
description: Esposter pnpm script reference for packages/app — lint, typecheck, test, format, dev, and build commands. Apply whenever running or recommending package scripts.
---

# Package Scripts (`packages/app`)

All commands must be run from `packages/app/` using `pnpm`. Never use `npm` or `npx`.

| Command             | Runs                                             | When to use                                     |
| ------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `pnpm lint`         | `eslint --config eslint.light.config.js .`       | CI/check-only lint verification                 |
| `pnpm lint:fix`     | `eslint --config eslint.light.config.js --fix .` | **Local lint verification** — use this directly |
| `pnpm lint:all`     | full ESLint (no `light` config)                  | Full lint pass (slower)                         |
| `pnpm lint:all:fix` | full ESLint fix                                  | Fix all lint errors (full pass)                 |
| `pnpm typecheck`    | `nuxt typecheck`                                 | TypeScript type checking                        |
| `pnpm test`         | `vitest` (watch mode)                            | Run this package's tests in watch mode          |
| `pnpm format`       | `oxfmt`                                          | Format code                                     |
| `pnpm format:check` | `oxfmt --check`                                  | Check formatting without writing                |
| `pnpm dev`          | `nuxt dev`                                       | Start dev server                                |
| `pnpm build`        | `nuxt build`                                     | Build for production                            |

> Oxlint is **not** part of any package's `lint` script — it runs as a single repo-wide pass from the **root** `pnpm lint` / `pnpm lint:fix` (one `.oxlintrc.json` at the repo root). Packages run ESLint only.

## Package Registry Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `pnpm info <pkg>`       | Show package metadata (version, description, deps) |
| `pnpm show <pkg>`       | Alias for `pnpm info`                              |
| `pnpm search <keyword>` | Search npm registry for packages                   |
| `pnpm outdated`         | List outdated dependencies                         |
| `pnpm list`             | List installed packages                            |

## Root Scripts

| Command                | Notes                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`               | Refresh deps/lockfile after manifest changes.                                                                                |
| `pnpm test`            | Whole suite once via unified root vitest `projects` config (all packages + scripts).                                         |
| `pnpm test:packages`   | All projects except the app (`--project "!@esposter/app"`) — fast local run, skips Nuxt. Local-only.                         |
| `pnpm coverage`        | `pnpm test` + coverage; root-only (packages have no `coverage` script). CI shards via `--reporter=blob` + `--merge-reports`. |
| `pnpm catalog:check`   | Verify `pnpm-workspace.yaml` catalog specifiers match the lockfile.                                                          |
| `pnpm depcruise:graph` | Generate `dependency-graph.svg` from dependency-cruiser via `graphviz-cli`.                                                  |

## Check Suite (after edits)

Run before declaring work done:

1. `pnpm typecheck`
2. `pnpm lint:fix` — **only for `packages/*` (non-app)**; skip when the change touches `packages/app` (slow), leave that to CI.
3. `pnpm test -u --run` — **only when actual code changed** (not for test-only or doc edits). `-u` refreshes snapshots, `--run` forces a single non-watch run.

Test-only changes: just run the affected test file(s) — no full `test -u --run` sweep needed.

## Key Rules

- **Lint locally** with `pnpm lint:fix` directly (packages only, not app) — never hand-edit to satisfy the linter. Reserve `pnpm lint`/`pnpm lint:all` for CI.
- **Windows tests run**: the old `spawn EPERM` config-startup crash is fixed via the minimal Vitest module allowlist in `packages/app/configuration/modules.ts`.
- **Long-running** (`dev`, `build`, `test`, `typecheck`): use `run_in_background: true` (2+ min).
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Use `pnpm exec <binary> <args>` or direct args (`pnpm test -u`).
