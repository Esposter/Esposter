---
name: package-scripts
description: Esposter pnpm script reference — packages/app scripts (lint, typecheck, test, format, dev, build), the root scripts (test, coverage, depcruise:graph, outdated:dependencies), and the ban on running the whole test suite locally rather than the paths a change touched. Apply whenever running or recommending package scripts.
---

# Package Scripts

`packages/app` scripts run from `packages/app/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## `packages/app`

| Command             | Runs                      | When to use                                     |
| ------------------- | ------------------------- | ----------------------------------------------- |
| `pnpm lint`         | `TIMING=1 eslint .`       | CI/check-only lint verification                 |
| `pnpm lint:fix`     | `TIMING=1 eslint --fix .` | **Local lint verification** — use this directly |
| `pnpm typecheck`    | `nuxt typecheck`          | TypeScript type checking                        |
| `pnpm test`         | `vitest` (watch mode)     | Run this package's tests in watch mode          |
| `pnpm format`       | `oxfmt`                   | Format code                                     |
| `pnpm format:check` | `oxfmt --check`           | Check formatting without writing                |
| `pnpm dev`          | `nuxt dev`                | Start dev server                                |
| `pnpm build`        | `nuxt build`              | Build for production                            |

> `oxfmt` formats code, not markdown, and no prettier binary is installed — reaching for `npx prettier` or
> `pnpm exec prettier` fails. A `.md` file's own layout is therefore hand-maintained: a table whose cells changed
> width is realigned in the edit that changed them, because nothing downstream will do it and nothing fails when
> it drifts.
>
> Oxlint is **not** part of any package's `lint` script — it runs as a single repo-wide pass from the **root** `pnpm lint` / `pnpm lint:fix` (one `.oxlintrc.json` at the repo root). Packages run ESLint only.

## Root Scripts

| Command                      | Runs                                              | Notes                                                                                                                                   |
| ---------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`                     | —                                                 | Refresh deps/lockfile after manifest changes.                                                                                           |
| `pnpm test`                  | `virrun -- vitest run`                            | Whole suite once via the root vitest `projects` config (every package + `scripts/` + `.agents/`). **CI only** — never run bare locally. |
| `pnpm test:packages`         | `virrun -- vitest run --project "!@esposter/app"` | All projects except the app — fast local run, skips Nuxt. Local-only.                                                                   |
| `pnpm coverage`              | `vitest run --coverage` (no virrun)               | Root-only (packages have no `coverage` script). CI shards via `--reporter=blob` + `--merge-reports`.                                    |
| `pnpm outdated:dependencies` | `tsx scripts/checkDependencies/index.ts`          | Checks manifests use `catalog:`/`workspace:`, and catalog/configDependency/`engines` specifiers against the lockfile + npm latest.      |
| `pnpm depcruise:graph`       | `virrun -- depcruise … \| graphviz -Tsvg`         | Generate `dependency-graph.svg`.                                                                                                        |

## Check Suite (after edits)

The suite runs **once per coherent chunk, on `develop`, before that chunk is pushed** — not per commit — see the git skill's "Verify On `develop`". Run before declaring work done:

1. `pnpm typecheck`
2. Lint fix — `pnpm lint:fix` from `packages/app/` for app changes, `pnpm lint:fix:packages` from the root for non-app `packages/*` changes. **Neither runs oxlint over the app**, and CI's root `pnpm lint` does: an app change that passes both of these still fails there on the rules only oxlint carries (unused bindings, comment capitalisation, `return-await`, the custom plugins). So an app change adds a root `pnpm lint` before it is pushed — the whole-repo pass, from the root, once per chunk.
3. Tests for **what the change touched**, and only that — **the whole suite is never run locally**. Pass paths: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Skip the step entirely for test-only or doc-only edits, running just the file(s) involved.

**A bare `pnpm test --run` is banned.** It takes tens of minutes on this repo, and it is CI's job — CI shards it across runners and is the thing that gates the merge. Locally it buys a slower answer to a question CI is already asking. The scope to run is what the diff touched: the files changed, their direct consumers, and any suite whose snapshots the change moves. When unsure whether a distant suite is affected, name it in the same invocation rather than widening to everything — a second path argument costs seconds, the full sweep costs the session.

## Key Rules

- **Lint locally** with the fix scripts — never hand-edit to satisfy the linter. Reserve the check-only `pnpm lint` for CI.
- **Vitest loads a minimal Nuxt module allowlist** (`packages/app/configuration/modules.ts`, under `process.env.VITEST`) — the full set crashes config startup on Windows. A test that needs an excluded module adds it to that branch rather than widening the allowlist for every run.
- **Long-running** (`dev`, `build`, `test`, `typecheck`): use `run_in_background: true` (2+ min).
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Use `pnpm exec <binary> <args>` or direct args (`pnpm test -u`).
