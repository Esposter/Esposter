---
name: package-scripts
description: Esposter pnpm script reference — apps/web scripts (lint, typecheck, test, format, dev, build), the root scripts (test, coverage, bench, graph:gen, outdated:dependencies, release, and the `ai:`-prefixed scripts an agent runs — the `ai:sweep:*` scans and the `ai:coderabbit:*` review tooling), a Settled note that the release stays one local script rather than a CI publish and another that a renamed export of a published package is never a major, the rule that every `.ts` script runs under `tsx` so an enum is always available and why a pre-install CI check is shell rather than a script, the `ai:<domain>:<verb>` prefix that marks a script no human types, the `scriptsComments` key that holds only a script's `@TODO:` because JSON has no comments and a rationale lives in the skill, and the ban on running the whole test suite locally rather than the paths a change touched. Apply whenever running or recommending package scripts.
---

# Package Scripts

`apps/web` scripts run from `apps/web/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **A root `build:<app>` script per app.** `build:web`, `build:functions` and `build:infra` existed, one
  `pnpm -C apps/<app> run build` delegation each, and `build:web` carried a `virrun --` besides. One app is that
  `-C` line at the call site: a root script that only delegates there is a second definition of the same line, one
  per app, that says nothing the flag does not. The sandbox prefix went with it — the app build is native for the
  reason the [virrun adoption](/docs/virrun/adoption) page gives. A root script earns its line only when it adds
  what a call site cannot say in a flag: a selector
  (`build:packages`), a chain (`build`, `release`), or a `virrun --` on a command a win32 developer runs
  (`typecheck`, `test`).
- **Majoring the published packages because an export was renamed.** `lerna.json` is `conventionalCommits: true`
  in fixed mode, so a `BREAKING CHANGE:` footer moves all seven public packages to the next whole number —
  including the ones that changed nothing. A renamed export is not a breaking change for these packages and a
  rename ships as the `refactor` it is; the reasoning, and the condition that would end it, are
  [no compatibility debt](/docs/architecture/no-compatibility-debt).
- **Splitting the release into a local `lerna version` and a CI publish** — a tag-triggered job publishing through npm's trusted publishing, which lerna-lite supports out of the box (`id-token: write`, a per-package token exchange, provenance attached for a public package). It buys an attestation that the published tarball is the one CI built. Nobody here is asking for that attestation, and the price is a release path that lives in two places and a per-package trusted-publisher registration on npmjs.com that fails closed the day a new package is added. **One script, run locally, is the whole release**: `pnpm release` gates the tree and hands `lerna publish` a version, a tag and a `dist` it just built, and 🚀 Release turns the pushed tag into a GitHub release. Publishing from a developer's machine is the deliberate simplification, not an oversight.

## `apps/web`

| Command             | Runs                      | When to use                                                        |
| ------------------- | ------------------------- | ------------------------------------------------------------------ |
| `pnpm lint`         | `TIMING=1 eslint .`       | CI/check-only lint verification                                    |
| `pnpm lint:fix`     | `TIMING=1 eslint --fix .` | ESLint only, this package only — never the last lint a change runs |
| `pnpm typecheck`    | `nuxt typecheck`          | TypeScript type checking — never `vue-tsc` directly, see below     |
| `pnpm test`         | `vitest` (watch mode)     | Run this package's tests in watch mode                             |
| `pnpm format`       | `oxfmt`                   | Format code                                                        |
| `pnpm format:check` | `oxfmt --check`           | Check formatting without writing                                   |
| `pnpm dev`          | `nuxt dev`                | Start dev server                                                   |
| `pnpm bench`        | `vitest bench --run`      | Run this package's benchmarks                                      |
| `pnpm build`        | `nuxt build`              | Build for production                                               |

**`nuxt typecheck` is the only typecheck, and `pnpm lint` from the repo root is the only lint.** Reaching past
either for the underlying binary — `vue-tsc -p tsconfig.json` in `apps/web`, `oxlint` over a path — checks
strictly less than CI does and reports success while CI fails: the app's real project is the generated
`.nuxt` tsconfig rather than the one in the package, and `oxlint` carries no ESLint rule, which is where the
import sort and every `no-restricted-syntax` ban live. Targeted `oxlint` is still worth running per unit
during a sweep, because it is seconds rather than minutes — but it is a fast pre-check, never the gate.

A backgrounded run of either reports the _wrapper's_ exit code, which is `0` even when the run inside it
failed. Read the output for `exited 1` or a `problem`/`error` line rather than trusting the status.

> `oxfmt` formats code, not markdown, and no prettier binary is installed — reaching for `npx prettier` or
> `pnpm exec prettier` fails. A `.md` file's own layout is therefore hand-maintained: a table whose cells changed
> width is realigned in the edit that changed them, because nothing downstream will do it and nothing fails when
> it drifts.
>
> Oxlint is **not** part of any package's `lint` script — it runs as a single repo-wide pass from the **root** `pnpm lint` / `pnpm lint:fix` (one `.oxlintrc.json` at the repo root). Packages run ESLint only.

## Root Scripts

| Command                                   | Runs                                                       | Notes                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`                                  | —                                                          | Refresh deps/lockfile after manifest changes.                                                                                                                                                                                                                                                                                                |
| `pnpm test`                               | `virrun -- vitest run`                                     | Whole suite once via the root vitest `projects` config — `apps/*`, `packages/*`, `scripts`. **Never run bare**: CI shards `vitest` directly rather than calling this, so a bare local run only buys a slower answer. Takes paths and vitest flags — `--project "apps/web"` is the app suite alone.                                           |
| `pnpm test:packages`                      | `virrun -- vitest run --project "packages/*"`              | Every library suite, no Nuxt — a `release` gate, and local shorthand for the same filter. Takes paths like `pnpm test` does: pass them.                                                                                                                                                                                                      |
| `pnpm build`                              | `--filter "@esposter/web..." run build`                    | The app and everything it imports, one derived selector, topological so the app builds last. No `virrun --` and no `build:<app>` — see Settled. The bare name meaning the app rather than the workspace is deliberate — Railway runs it as its default build command.                                                                        |
| `pnpm build:packages`                     | `pnpm -r --filter "./packages/*" run build`                | The libraries as a set: what CI caches and hands to every check. No app is in it, since nothing imports an app's `dist` — the coverage shards build the two whose bundles the suite asserts against.                                                                                                                                         |
| `pnpm coverage`                           | `vitest run --coverage` (no virrun)                        | Root-only (packages have no `coverage` script). Both CI test jobs call it with trailing flags rather than reaching for `vitest` themselves — a shard is `pnpm coverage --reporter=default --reporter=blob --shard=i/n`, the merge is `pnpm coverage --merge-reports`.                                                                        |
| `pnpm bench`                              | `pnpm -r --workspace-concurrency=1 --if-present run bench` | Every member owning a bench, one at a time — the local gate that rewrites the committed `*.bench.md`. The concurrency flag is load-bearing twice over: parallel benches skew each other's numbers, and `scripts`' cold-build bench deletes each `packages/*/dist` out from under a concurrent member's config load.                          |
| `pnpm bench:ci`                           | `vitest bench --run`                                       | One process over every project's bench files at once — a smoke signal that they all still execute, not a measurement. What the 🏎️ Bench job runs, and the only caller. Not a shorter `pnpm bench`; see the `bench` skill.                                                                                                                    |
| `pnpm outdated:dependencies`              | `pnpm -C scripts run outdated:dependencies`                | Checks manifests use `catalog:`/`workspace:`, and catalog/configDependency/`engines` specifiers against the lockfile + npm latest.                                                                                                                                                                                                           |
| `pnpm graph:gen`                          | `pnpm -C scripts run graph:gen`                            | Regenerate `dependency-graph.svg` from the workspace manifests. Run it after changing one.                                                                                                                                                                                                                                                   |
| `pnpm release`                            | checks, then `lerna publish`                               | The whole release, run locally — see Settled above. Lerna versions EVERY workspace member (`lerna.json`'s `packages` repeats the pnpm globs, or it silently defaults to `packages/*`), while the gates in front of it stay `packages/*`-scoped and publish skips the private ones — [monorepo tooling](/docs/architecture/monorepo-tooling). |
| `pnpm ai:coderabbit:exclusions "<range>"` | `pnpm -C scripts run ai:coderabbit:exclusions`             | The `path_filters` lines for the files a `<base>..<head>` range lets out of review — pure renames, import-path-only edits and, given `<rename-sha> OldName=NewName …` after the range, rename-token-only edits — never a protected class (`coderabbit` skill, `references/exclusions.md`).                                                   |
| `pnpm ai:coderabbit:feedback "<pr>"`      | `pnpm -C scripts run ai:coderabbit:feedback`               | The newest review's buckets, its unresolved threads with the comment id a reply needs, the stated counts reconciled against them, and the walkthrough's merge risk and pre-merge checks.                                                                                                                                                     |
| `pnpm ai:coderabbit:probe "<pr>"`         | `pnpm -C scripts run ai:coderabbit:probe`                  | Posts `@coderabbitai review` and waits for the bot's answer — `Already reviewed` means the checkpoint covers the head. **Spends a review slot when it does start one.**                                                                                                                                                                      |
| `pnpm ai:coderabbit:window "<pr>"`        | `pnpm -C scripts run ai:coderabbit:window`                 | The last reviewed sha, the files pushed since it, and the files the next push would add.                                                                                                                                                                                                                                                     |
| `pnpm ai:sweep:constant-scope`            | `pnpm -C scripts run ai:sweep:constant-scope`              | One sweep find recipe, as a tested script rather than a ledger code block (`sweeps` skill). One `ai:sweep:*` per scan.                                                                                                                                                                                                                       |
| `pnpm ai:sweep:repeated-list-items`       | `pnpm -C scripts run ai:sweep:repeated-list-items`         | A component writing three or more `v-list-item`s out one by one, with no `v-for` anywhere in it.                                                                                                                                                                                                                                             |
| `pnpm ai:sweep:shared-export-consumers`   | `pnpm -C scripts run ai:sweep:shared-export-consumers`     | Every `packages/shared` export naming fewer than two consumer packages, which is what earns a place there.                                                                                                                                                                                                                                   |
| `pnpm ai:sweep:skill-docs`                | `pnpm -C scripts run ai:sweep:skill-docs`                  | The skill tree structural check: a page over budget, a reference nothing indexes, a citation resolving nowhere.                                                                                                                                                                                                                              |
| `pnpm ai:sweep:unterminated-results`      | `pnpm -C scripts run ai:sweep:unterminated-results`        | Every `getResult` call, matched to its closing bracket, whose chain nothing terminates.                                                                                                                                                                                                                                                      |

## The `ai:` prefix marks a script no human types

A script whose only caller is an agent is named **`ai:<domain>:<verb>`** — a sweep scan, review tooling, anything wired for a skill or a ledger to run. A script a person types after a manifest edit or a version bump keeps its plain name, so the prefix answers the one question a manifest reader has: which entries are not for them.

It is decided by **audience**, never by what the script does or where its source lives, and it is a name rather than a guard — nothing stops a person running one. Both manifests carry the same name, the root's being the usual `pnpm -C <package> run <same name>` delegation. The rule itself is the `skill-authoring` skill's (`references/embedded-recipes.md`), which also says when a recipe earns a script at all.

## Running a TypeScript Script

**A `.ts` script runs under `tsx`.** Node strips types natively and would run most of these files, but its
stripping cannot transform an `enum` — and an enum is this repo's default shape for a categorical value
(`typescript` skill). Picking the runner first therefore hands the type system to the runner: the script either
declares the enum and dies at startup with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`, or a union gets written where the
enum belonged and a convention has been bent to suit a loader. **The code is never bent to reach `node`.** One
devDependency removes the question, so a new script is `tsx path/to/index.ts` and `tsx` is a devDependency of
every package that owns one — `scripts`, `apps/web`, `packages/db-mock`. The root declares none: it owns no `.ts`
script of its own, and each `graph:gen`/`outdated:dependencies`/`ai:*` name there is a `pnpm -C scripts run`
delegation to the package that does.

Two further things `tsx` absorbs, which is why there is nothing to gain by trying `node` first:

- **A tsconfig `paths` alias** — node resolves `imports` subpaths and nothing else, so `@/models/…` is a bare
  specifier it goes looking for in `node_modules`. `apps/web/scripts/*` reaches app source through the
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

JSON has no comments, so a script that records something to undo later carries it in a sibling top-level
**`scriptsComments`** object keyed by the script name — never a `"// …"` key inside `scripts`, which pnpm lists as a
runnable script. The value is one `@TODO:`-prefixed string naming the condition that ends it, and that is **all**
the object holds: why a script is shaped as it is lives in this skill's table and the docs page that owns it,
where the reasoning already sits, so a copy in the manifest is a second one that drifts.

```json
{
  "scriptsComments": {
    "build": "@TODO: restore `pnpm build:docs` to the chain when …"
  }
}
```

## Check Suite (after edits)

The suite runs **once per coherent chunk, on `develop`, before that chunk is pushed** — not per commit — see the git skill's "Verify On `develop`". Run before declaring work done:

1. `pnpm typecheck`
2. Lint fix — **`pnpm lint:fix` from the repo root**: oxlint over the whole tree, then ESLint, then every package's own `lint:fix`. A package's own is ESLint over that package and nothing else, so it carries none of the rules only oxlint has (unused bindings, comment capitalisation, `return-await`, the custom plugins) — a change that passes it still fails CI, which runs the root pass. Reach for the package-local one only to iterate inside one package mid-change; the last lint a chunk runs is the root one.
3. Tests for **what the change touched**, and only that — **the whole suite is never run locally**. Pass paths: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Skip the step entirely for test-only or doc-only edits, running just the file(s) involved.

**A bare `pnpm test --run` is banned.** It takes tens of minutes on this repo, and it is CI's job — CI shards it across runners and is the thing that gates the merge. Locally it buys a slower answer to a question CI is already asking. The scope to run is what the diff touched: the files changed, their direct consumers, and any suite whose snapshots the change moves. When unsure whether a distant suite is affected, name it in the same invocation rather than widening to everything — a second path argument costs seconds, the full sweep costs the session.

## Key Rules

- **Lint locally** with the fix scripts — never hand-edit to satisfy the linter. The root `pnpm lint:fix` is the one that matches CI, so it is what a chunk ends on; the check-only root `pnpm lint` differs from it only in not writing the fixes.
- **Vitest loads a minimal Nuxt module allowlist** (`apps/web/configuration/modules.ts`, under `process.env.VITEST`) — the full set crashes config startup on Windows. A test that needs an excluded module adds it to that branch rather than widening the allowlist for every run.
- **Long-running** (`dev`, `build`, `test`, `typecheck`, root `lint:fix`): use `run_in_background: true` (2+ min),
  and keep working while it runs — the check suite is not a place to sit and wait (`context-efficiency`, "The pass
  runs in the background").
- **A `--filter` that matches nothing exits 0 and prints nothing**, so a check run behind one reports success for having run no check at all. `pnpm --filter @esposter/virrun typecheck` is that failure: the package's npm name is `virrun`, not `@esposter/virrun` (the table in `AGENTS.md` is the list — `azure-mock`, `parse-tmx`, `virrun` and `vue-phaserjs` carry no scope), and the typo passed clean while CI failed on the file it never compiled. Prefer `pnpm -C <dir>` or running from the package directory, which cannot silently match nothing; when a filter is the right tool, treat empty output from a check as "it did not run" until a real compiler banner or test count proves otherwise.
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Pass them as direct args instead — `pnpm coverage --reporter=blob --shard=1/4`, `pnpm test -u`. pnpm appends them verbatim even when the flag is one of its own (`--reporter` is a pnpm CLI option and is still forwarded).
- **A caller runs the script, not the binary under it.** `pnpm exec <binary>` in a workflow is a second definition of an invocation the root manifest already owns, and it drifts silently — CI's coverage shards spelled out `vitest run --coverage` for exactly as long as it took the two to disagree. Reach for `pnpm exec` only where no script owns the invocation; if a workflow needs a shape no script has, add the script (that is what `bench:ci` is).
