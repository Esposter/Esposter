---
name: package-scripts
description: Esposter pnpm script reference — packages/app scripts (lint, typecheck, test, format, dev, build), the root scripts (test, coverage, graph:gen, outdated:dependencies, release, the sweep:* scans), a Settled note that the release stays one local script rather than a CI publish and another that a renamed export of a published package is never a major, the rule that every `.ts` script runs under `tsx` so an enum is always available and why a pre-install CI check is shell rather than a script, the `scriptsComments` key that carries a script's comment because JSON has none, and the ban on running the whole test suite locally rather than the paths a change touched. Apply whenever running or recommending package scripts.
---

# Package Scripts

`packages/app` scripts run from `packages/app/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **Majoring the published packages because an export was renamed.** `lerna.json` is `conventionalCommits: true`
  in fixed mode, so a `BREAKING CHANGE:` footer moves all seven public packages to the next whole number —
  including the ones that changed nothing. A renamed export is not a breaking change for these packages and a
  rename ships as the `refactor` it is; the reasoning, and the condition that would end it, are
  [no compatibility debt](/docs/architecture/no-compatibility-debt).
- **Splitting the release into a local `lerna version` and a CI publish** — a tag-triggered job publishing through npm's trusted publishing, which lerna-lite supports out of the box (`id-token: write`, a per-package token exchange, provenance attached for a public package). It buys an attestation that the published tarball is the one CI built. Nobody here is asking for that attestation, and the price is a release path that lives in two places and a per-package trusted-publisher registration on npmjs.com that fails closed the day a new package is added. **One script, run locally, is the whole release**: `pnpm release` gates the tree and hands `lerna publish` a version, a tag and a `dist` it just built, and 🚀 Release turns the pushed tag into a GitHub release. Publishing from a developer's machine is the deliberate simplification, not an oversight.

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

| Command                           | Runs                                              | Notes                                                                                                                                   |
| --------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`                          | —                                                 | Refresh deps/lockfile after manifest changes.                                                                                           |
| `pnpm test`                       | `virrun -- vitest run`                            | Whole suite once via the root vitest `projects` config (every package + `scripts/` + `.agents/`). **CI only** — never run bare locally. |
| `pnpm test:packages`              | `virrun -- vitest run --project "!@esposter/app"` | All projects except the app — skips Nuxt. Local-only, and takes paths like `pnpm test` does: pass them.                                 |
| `pnpm coverage`                   | `vitest run --coverage` (no virrun)               | Root-only (packages have no `coverage` script). CI shards via `--reporter=blob` + `--merge-reports`.                                    |
| `pnpm outdated:dependencies`      | `tsx scripts/outdatedDependencies/index.ts`       | Checks manifests use `catalog:`/`workspace:`, and catalog/configDependency/`engines` specifiers against the lockfile + npm latest.      |
| `pnpm graph:gen`                  | `tsx scripts/dependencyGraph/index.ts`            | Regenerate `dependency-graph.svg` from the workspace manifests. Run it after changing one.                                              |
| `pnpm release`                    | checks, then `lerna publish`                      | The whole release, run locally — see Settled above.                                                                                     |
| `pnpm sweep:constant-scope`       | `tsx scripts/sweeps/constantScope/index.ts`       | One sweep find recipe, as a tested script rather than a ledger code block (`sweeps` skill). One `sweep:*` per scan.                     |
| `pnpm sweep:skill-docs`           | `tsx scripts/sweeps/skillDocs/index.ts`           | The skill tree structural check: a page over budget, a reference nothing indexes, a citation resolving nowhere.                         |
| `pnpm sweep:unterminated-results` | `tsx scripts/sweeps/unterminatedResults/index.ts` | Every `getResult` call, matched to its closing bracket, whose chain nothing terminates.                                                 |

## Running a TypeScript Script

**A `.ts` script runs under `tsx`.** Node strips types natively and would run most of these files, but its
stripping cannot transform an `enum` — and an enum is this repo's default shape for a categorical value
(`typescript` skill). Picking the runner first therefore hands the type system to the runner: the script either
declares the enum and dies at startup with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`, or a union gets written where the
enum belonged and a convention has been bent to suit a loader. **The code is never bent to reach `node`.** One
devDependency removes the question, so a new script is `tsx path/to/index.ts` and `tsx` is a devDependency of
every package that owns one — the root (for `scripts/**`), `packages/app`, `packages/db-mock`.

Two further things `tsx` absorbs, which is why there is nothing to gain by trying `node` first:

- **A tsconfig `paths` alias** — node resolves `imports` subpaths and nothing else, so `@/models/…` is a bare
  specifier it goes looking for in `node_modules`. `packages/app/scripts/*` reaches app source through the
  Nuxt-generated `@/*`, `@@/*` and `#shared/*`, so both of them (`phaser:gen` and `tiled:gen`) pass
  `--tsconfig tsconfig.root.json`.
- **An extensionless relative import** (`../src/constants`) — node wants the extension, tsx does not. Banned
  anyway, since a script addresses its package through `#src/*` (`file-organization`).

**`node` stays where the file is not TypeScript.** `db:run` runs `drizzle-kit`'s CJS bin directly and needs no
loader wrapped around it.

**A check that has to run before an install belongs in CI's own shell, not in a script.** `tsx` is a
devDependency, so a `.ts` script cannot answer a question asked before `node_modules` exists — which is exactly
what CI's package-build gate asks, on a cache hit designed to need no install. That gate is therefore a few lines
of bash in `.github/actions/verify-package-builds`, beside the bash that computes the cache key. Reaching for bare
`node` instead would pick the runner before the code and put an enum ban on a script for the rest of its life.

## `scriptsComments`

JSON has no comments, so a script whose command needs one carries it in a sibling top-level **`scriptsComments`** object keyed by the script name — never a `"// …"` key inside `scripts`, which pnpm lists as a runnable script. The value is the whole note as one string, `@TODO:`-prefixed when it records something to undo later:

```json
{
  "scripts": {
    "build": "pnpm build:packages && pnpm build:app"
  },
  "scriptsComments": {
    "build": "@TODO: restore `pnpm build:docs` to the chain when …"
  }
}
```

Only the scripts that need a note appear there — this is not a place to document the whole script table, which is what this skill is for.

## Check Suite (after edits)

The suite runs **once per coherent chunk, on `develop`, before that chunk is pushed** — not per commit — see the git skill's "Verify On `develop`". Run before declaring work done:

1. `pnpm typecheck`
2. Lint fix — `pnpm lint:fix` from `packages/app/` for app changes, `pnpm lint:fix:packages` from the root for non-app `packages/*` changes. **Neither runs oxlint over the app**, and CI's root `pnpm lint` does: an app change that passes both of these still fails there on the rules only oxlint carries (unused bindings, comment capitalisation, `return-await`, the custom plugins). So an app change adds a root `pnpm lint` before it is pushed — the whole-repo pass, from the root, once per chunk.
3. Tests for **what the change touched**, and only that — **the whole suite is never run locally**. Pass paths: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Skip the step entirely for test-only or doc-only edits, running just the file(s) involved.

**A bare `pnpm test --run` is banned.** It takes tens of minutes on this repo, and it is CI's job — CI shards it across runners and is the thing that gates the merge. Locally it buys a slower answer to a question CI is already asking. The scope to run is what the diff touched: the files changed, their direct consumers, and any suite whose snapshots the change moves. When unsure whether a distant suite is affected, name it in the same invocation rather than widening to everything — a second path argument costs seconds, the full sweep costs the session.

## Key Rules

- **Lint locally** with the fix scripts — never hand-edit to satisfy the linter. The check-only root `pnpm lint` is not a substitute for them: it is the extra pass an app change owes before it is pushed, because it is the only one that runs oxlint over the app (see the check suite above).
- **Vitest loads a minimal Nuxt module allowlist** (`packages/app/configuration/modules.ts`, under `process.env.VITEST`) — the full set crashes config startup on Windows. A test that needs an excluded module adds it to that branch rather than widening the allowlist for every run.
- **Long-running** (`dev`, `build`, `test`, `typecheck`): use `run_in_background: true` (2+ min).
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Use `pnpm exec <binary> <args>` or direct args (`pnpm test -u`).
