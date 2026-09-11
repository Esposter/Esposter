---
name: package-scripts
description: Esposter pnpm script reference — apps/web scripts (lint, typecheck, test, format, dev, build), the root scripts (test, coverage, bench, graph:gen, outdated:dependencies, release), a Settled list (no root `build:<app>` script per app, the release stays one local script rather than a CI publish, a renamed export of a published package is never a major), `nuxt typecheck` and the root lint being the only checks that match CI, the wrapper exit code a backgrounded run reports, `oxfmt` never touching markdown so a table is realigned by hand, the `scriptsComments` key that holds only a script's `@TODO:`, the check suite run once per chunk with tests scoped to the paths touched, and the pnpm traps (a `--filter` matching nothing exits 0, `pnpm <script> -- <args>` drops the args, a workflow runs the script not the binary) — plus deep dives on running a `.ts` script under `node` where it can and `tsx` where it cannot without ever bending the code to fit `node`, and why a pre-install CI check is shell, and on the `ai:sweep:*` / `ai:coderabbit:*` script catalogue an agent runs. Apply whenever running or recommending package scripts.
---

# Package Scripts

`apps/web` scripts run from `apps/web/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **A root `build:<app>` script per app.** `build:web`, `build:functions` and `build:infra` existed, one
  `pnpm -C apps/<app> run build` delegation each, and `build:web` carried a `virrun --` besides. One app is that
  `-C` line at the call site: a root script that only delegates there is a second definition of the same line, one
  per app, that says nothing the flag does not. The sandbox prefix went with it — the app build is native for the
  reason `apps/web/content/docs/virrun/adoption.md` gives. A root script earns its line only when it adds what a
  call site cannot say in a flag: a selector (`build:packages`), a chain (`build`, `release`), or a `virrun --` on
  a command a win32 developer runs (`typecheck`, `test`).
- **Majoring the published packages because an export was renamed.** `lerna.json` is `conventionalCommits: true`
  in fixed mode, so a `BREAKING CHANGE:` footer moves all seven public packages to the next whole number —
  including the ones that changed nothing. A renamed export is not a breaking change for these packages and a
  rename ships as the `refactor` it is; the reasoning, and the condition that would end it, are
  `apps/web/content/docs/architecture/no-compatibility-debt.md`.
- **Splitting the release into a local `lerna version` and a CI publish** through npm's trusted publishing. It buys an attestation that the published tarball is the one CI built, which nobody here asks for, at the price of a release path in two places and a per-package trusted-publisher registration that fails closed the day a package is added. **One script, run locally, is the whole release**: `pnpm release` gates the tree and hands `lerna publish` a version, a tag and a `dist` it just built, and 🚀 Release turns the pushed tag into a GitHub release.

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
`.nuxt` tsconfig rather than the one in the package, and a package's `lint` is ESLint alone. Which rules only
the root pass carries, and when a targeted `oxlint` is still worth running, is the `oxlint` skill's.

A backgrounded run of either reports the _wrapper's_ exit code, which is `0` even when the run inside it
failed. Read the output for `exited 1` or a `problem`/`error` line rather than trusting the status.

> `oxfmt` formats code, not markdown, and no prettier binary is installed — reaching for `npx prettier` or
> `pnpm exec prettier` fails. A `.md` file's own layout is therefore hand-maintained: a table whose cells changed
> width is realigned in the edit that changed them, because nothing downstream will do it and nothing fails when
> it drifts.

## Root Scripts

| Command                      | Runs                                                       | Notes                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`                     | —                                                          | Refresh deps/lockfile after manifest changes.                                                                                                                                                                                                                                                                                                 |
| `pnpm test`                  | `virrun -- vitest run`                                     | Whole suite once via the root vitest `projects` config — `apps/*`, `packages/*`, `scripts`; never bare (`testing` skill). Takes paths and vitest flags — `--project "apps/web"` is the app suite alone.                                                                                                                                       |
| `pnpm test:packages`         | `virrun -- vitest run --project "packages/*"`              | Every library suite, no Nuxt — a `release` gate, and local shorthand for the same filter. Takes paths like `pnpm test` does: pass them.                                                                                                                                                                                                       |
| `pnpm build`                 | `--filter "@esposter/web..." run build`                    | The app and everything it imports, one derived selector, topological so the app builds last. No `virrun --` and no `build:<app>` — see Settled. The bare name meaning the app rather than the workspace is deliberate — Railway runs it as its default build command.                                                                         |
| `pnpm build:packages`        | `pnpm -r --filter "./packages/*" run build`                | The libraries as a set: what CI caches and hands to every check. No app is in it, since nothing imports an app's `dist` — the coverage shards build the two whose bundles the suite asserts against.                                                                                                                                          |
| `pnpm coverage`              | `vitest run --coverage` (no virrun)                        | Root-only (packages have no `coverage` script). Both CI test jobs call it with trailing flags rather than reaching for `vitest` themselves — a shard is `pnpm coverage --reporter=default --reporter=blob --shard=i/n`, the merge is `pnpm coverage --merge-reports`.                                                                         |
| `pnpm bench`                 | `pnpm -r --workspace-concurrency=1 --if-present run bench` | Every member owning a bench, one at a time — the local gate that rewrites the committed `*.bench.md`. Why the concurrency flag is load-bearing is the `bench` skill's.                                                                                                                                                                        |
| `pnpm bench:ci`              | `vitest bench --run`                                       | One process over every project's bench files at once — a smoke signal that they all still execute, not a measurement. What the 🏎️ Bench job runs, and the only caller. Not a shorter `pnpm bench`; see the `bench` skill.                                                                                                                     |
| `pnpm outdated:dependencies` | `pnpm -C scripts run outdated:dependencies`                | Checks manifests use `catalog:`/`workspace:`, and catalog/configDependency/`engines` specifiers against the lockfile + npm latest.                                                                                                                                                                                                            |
| `pnpm graph:gen`             | `pnpm -C scripts run graph:gen`                            | Regenerate `dependency-graph.svg` from the workspace manifests. Run it after changing one.                                                                                                                                                                                                                                                    |
| `pnpm release`               | checks, then `lerna publish`                               | The whole release, run locally — see Settled above. Lerna versions EVERY workspace member (`lerna.json`'s `packages` repeats the pnpm globs, or it silently defaults to `packages/*`), while the gates in front of it stay `packages/*`-scoped and publish skips the private ones — `apps/web/content/docs/architecture/monorepo-tooling.md`. |

The `ai:<domain>:<verb>` entries are the scripts no human types, named by audience — the rule is the
`skill-authoring` skill's (`references/embedded-recipes.md`). Which ones exist and what each prints, read when a
sweep or a review needs its script: `references/ai-scripts.md`.

## A `.ts` script runs under `node` where it can, `tsx` where it cannot — `references/typescript-scripts.md`

Node strips types natively; an `enum`, a tsconfig alias or an extensionless import moves the script to `tsx`, and
the code is never bent to fit `node`. **Adding a script, choosing its runner, or writing a check CI runs before an
install** is that page.

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
2. **`pnpm lint:fix` from the repo root** — the one lint that matches CI, since a package's own `lint:fix` is ESLint over that package alone (`oxlint` skill). Reach for the package-local one only to iterate inside one package mid-change; the last lint a chunk runs is the root one.
3. Tests for **what the change touched**, passed as paths: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Never the whole suite — the ban, and how the paths are scoped, are the `testing` skill's ("Never run the full suite locally"). Skip the step entirely for test-only or doc-only edits, running just the file(s) involved.

## Key Rules

- **A `--filter` that matches nothing exits 0 and prints nothing**, so a check run behind one reports success for having run no check at all. `pnpm --filter @esposter/virrun typecheck` is that failure: the package's npm name is `virrun`, not `@esposter/virrun` (the table in `AGENTS.md` is the list), and the typo passed clean while CI failed on the file it never compiled. Prefer `pnpm -C <dir>` or running from the package directory, which cannot silently match nothing; when a filter is the right tool, treat empty output from a check as "it did not run" until a real compiler banner or test count proves otherwise.
- **Never use `pnpm <script> -- <args>`**: pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Pass them as direct args instead — `pnpm coverage --reporter=blob --shard=1/4`, `pnpm test -u`. pnpm appends them verbatim even when the flag is one of its own (`--reporter` is a pnpm CLI option and is still forwarded).
- **A caller runs the script, not the binary under it.** `pnpm exec <binary>` in a workflow is a second definition of an invocation the root manifest already owns, and it drifts silently — CI's coverage shards spelled out `vitest run --coverage` for exactly as long as it took the two to disagree. Reach for `pnpm exec` only where no script owns the invocation; if a workflow needs a shape no script has, add the script (that is what `bench:ci` is).
