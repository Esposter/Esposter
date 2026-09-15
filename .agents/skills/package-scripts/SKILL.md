---
name: package-scripts
description: Apply when running or recommending any pnpm script. Esposter pnpm script reference — apps/web scripts (lint, typecheck, test, format, dev, build), a Settled list (no root build:<app> per app, the release as one local script, a renamed export never a major), nuxt typecheck and the root lint as the only checks matching CI, the wrapper exit code a backgrounded run reports, oxfmt formatting markdown tables, the scriptsComments key, the check suite once per chunk with tests scoped to the paths touched, and the pnpm traps (a --filter matching nothing exits 0, pnpm <script> -- <args> drops the args, a workflow runs the script not the binary, a script invoked bare) — plus deep dives on the root scripts, each pnpm trap, running a .ts script under node or tsx, and the ai:sweep:* / ai:coderabbit:* / ai:citations:* catalogue an agent runs.
---

# Package Scripts

`apps/web` scripts run from `apps/web/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **A root `build:<app>` script per app.** One app is `pnpm -C apps/<app> run build` at the call site, and a root script that only delegates there is a second definition of the same line; a root script earns its line only when it adds a selector, a chain or a `virrun --` (`apps/web/content/docs/architecture/monorepo-tooling.md`, "Recursive script orchestration").
- **Majoring the published packages because an export was renamed.** `lerna.json` is `conventionalCommits: true` in fixed mode, so a `BREAKING CHANGE:` footer moves all seven public packages to the next whole number; a rename ships as the `refactor` it is (`apps/web/content/docs/architecture/no-compatibility-debt.md`).
- **Splitting the release into a local `lerna version` and a CI publish** through npm's trusted publishing. It buys an attestation nobody here asks for, at the price of a release path in two places and a per-package registration that fails closed on every new package; one script run locally is the whole release (`apps/web/content/docs/architecture/monorepo-tooling.md`, "Lerna Lite").

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

> `oxfmt` formats markdown too — a table whose cells changed width is realigned by `pnpm format` (or `pnpm exec oxfmt <paths>`
> for a few files). No prettier binary is installed, so `pnpm exec prettier` fails — and `npx prettier` is not the
> fallback: `npx` is unsupported here, and rather than failing it would fetch an unpinned prettier from the registry.

## Root Scripts — `references/root-scripts.md`

`pnpm i` after a manifest change, `pnpm test` for the whole suite once (the ban on running it locally is the `testing` skill's), `build:packages` for the libraries as a set, `pnpm release` for the whole release. Which script wraps what, is that page; the `ai:<domain>:<verb>` scripts no human types — which exist and what each prints, read when a sweep or a review needs its script — are `references/ai-scripts.md`.

## A `.ts` script runs under `node` where it can, `tsx` where it cannot — `references/typescript-scripts.md`

Node strips types natively; an `enum`, a tsconfig alias or an extensionless import moves the script to `tsx`, and
the code is never bent to fit `node`. **Adding a script, choosing its runner, or writing a check CI runs before an
install** is that page.

## `scriptsComments` — `references/scripts-comments.md`

JSON has no comments: a script that records something to undo later carries one `@TODO:` string in a sibling top-level `scriptsComments` object keyed by the script name, and nothing else — never a `"// …"` key inside `scripts`, which pnpm lists as runnable.

## Check Suite (after edits)

The suite runs **once per coherent chunk, on `ai/queue`** — not per commit — see the git skill's "Verify Once Per Chunk". Run before declaring work done:

1. `pnpm typecheck`
2. **`pnpm lint:fix` from the repo root** — CI runs root `pnpm lint`, and root `lint:fix` is that same scope (oxlint, ESLint, every package's lint) with autofix on, so what it leaves unfixed is what CI would report; a package's own `lint:fix` is ESLint over that package alone (`oxlint` skill). Reach for the package-local one only to iterate inside one package mid-change; the last lint a chunk runs is the root one.
3. Tests for **what the change touched**, passed as package-relative paths from `apps/web/` — root `pnpm test` is the whole suite under virrun and resolves a path against the repo root, so an `app/`-relative path matches nothing there: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Never the whole suite — the ban, and how the paths are scoped, are the `testing` skill's ("Never run the full suite locally"). A test-only edit runs the test file(s) it touched. Only a doc-only edit skips the step, and not one under `apps/web/content/docs`, whose `index.test.ts` parses every page's diagram.

## Key Rules

- **A `--filter` that matches nothing exits 0** — prefer `pnpm -C <dir>`, and treat a filtered check's empty output as "it did not run" until a real compiler banner or test count proves otherwise.
- **Never `pnpm <script> -- <args>`** — pnpm forwards the literal `--` and the flags are dropped; pass them as direct args (`pnpm test -u`).
- **A caller runs the script, not the binary under it** — `pnpm exec <binary>` in a workflow is a second definition that drifts; where no script has the shape, add one (`bench:ci`).
- **A script is invoked bare — `pnpm <script>`, never `pnpm run <script>`** — including under `-C` and `--filter`. `run` is load-bearing only for a name that shadows a pnpm command, and that collision is the thing to spot.
- How each of the four fails, the name that shadows a command today, and the `@esposter/virrun` typo that passed clean while CI failed: `references/pnpm-traps.md`.
