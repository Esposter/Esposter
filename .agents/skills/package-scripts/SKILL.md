---
name: package-scripts
description: Apply when running or recommending any pnpm script. Esposter's pnpm scripts — which script runs each check, build, bench and the release, and from where, and how a pnpm invocation fails without saying so — plus the ai:* catalogue an agent runs.
---

# Package Scripts

`apps/web` scripts run from `apps/web/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **A root `build:<app>` script per app.** A root script that only delegates to a package is a second definition of the line at the call site; what earns a root script its line is `openspec/specs/architecture/monorepo-tooling/design.md`, "Recursive script orchestration".
- **Majoring the published packages because an export was renamed or removed.** `lerna.json` is `conventionalCommits: true` in fixed mode, so a `BREAKING CHANGE:` footer moves every public package to the next whole number; a rename or a removal ships as the `refactor` it is, and a package is kept at its smallest form rather than its oldest surface (`openspec/specs/architecture/no-compatibility-debt/design.md`).
- **Publishing a release from a developer's machine.** The release is the nightly `Release.yaml` run: `pnpm release` gates the tree, versions `main` and pushes the version commit and its tag, then publishes through npm's trusted publishing; the push to `main` that the release makes starts the review run (`MergeMain.yaml`), which merges the version commit back into `ai/queue`. No person runs it (`openspec/specs/architecture/monorepo-tooling/design.md`, "Lerna Lite").

## `apps/web`

**`apps/web`'s `pnpm typecheck` is the only typecheck, and root `vp run lint` the only lint** — why a root check aggregates its leaves and what the binaries under them miss is `references/app-scripts.md`.

## Root Scripts — `references/root-scripts.md`

`pnpm i` after a manifest change, `pnpm test` for the whole suite once (the ban on running it locally is the `testing` skill's, `references/running-the-suite.md`), `vp run build:packages` for the libraries as a set, `pnpm release` for the nightly release CI runs, and `vp run lint:unused` for knip; the `ai:<domain>:<verb>` scripts no human types are `references/ai-scripts.md`.

## A `.ts` script runs under `node` where it can, `vpx` where it cannot — `references/typescript-scripts.md`

Node strips types natively; an `enum`, a tsconfig alias or an extensionless import moves the script to `vpx`, and the code is never bent to fit `node`.

## `"scriptsComments"` — `references/scripts-comments.md`

A script that records something to undo later carries one `@TODO:` string in a sibling top-level `"scriptsComments"` object — never a `"// …"` key inside `scripts`, which pnpm lists as runnable (`scripts/src/workspace/packageScripts.test.ts`).

## Check Suite (after edits)

Once, after all the edits going out together: the tests of what the change touched, as package-relative paths — never the whole suite. Typecheck and lint are CI's (`references/check-suite.md`, the `running-checks` skill).

## Key Rules

- **A `--filter` that matches nothing exits 0** — prefer `pnpm -C <dir>`, and treat a filtered check's empty output as "it did not run" until a real compiler banner or test count proves otherwise.
- **Never `pnpm <script> -- <args>`** — pnpm forwards the literal `--` and the flags are dropped; pass them as direct args (`pnpm test -u`).
- **A caller runs the script, not the binary under it** — `pnpm exec <binary>` in a workflow is a second definition that drifts; where no script has the shape, add one (`bench:ci`).
- **A command stays a script unless caching earns it a `vp run` task** in the root `vite.config.ts` — the three conditions, and what each rules out, are `openspec/specs/architecture/vite-plus/design.md`, "The task cache".
- **A script is invoked bare — `pnpm <script>`, never `pnpm run <script>`** — including under `-C` and `--filter`. `run` is load-bearing only for a name that shadows a pnpm command; `scripts/src/workspace/packageScripts.test.ts` fails on any other inside a manifest, so a workflow or a doc is where the collision is still spotted by eye.
- **A tool's default configuration stays unless a measured reason still holds.** An override, or a hook built to work around a default, is removed when its reason goes.
- How each fails, and the name that shadows a pnpm command: `references/pnpm-traps.md`.

## Reference pages

- `references/app-scripts.md` — when running a script from `apps/web`, or reaching for the binary under one.
- `references/check-suite.md` — when a change's tests are owed: the directory and the test paths.
- `references/root-scripts.md` — when choosing which root script runs a build, the suite, a bench, a dependency report or the release.
- `references/ai-scripts.md` — when a sweep, a review or a skill needs the script that runs its scan.
- `references/typescript-scripts.md` — when adding a `.ts` script or choosing its runner.
- `references/scripts-comments.md` — when a script is shaped by something that should later be undone.
- `references/pnpm-traps.md` — when a filtered check passes too quickly, flags are forwarded through a script, or a `run` prefix is in question.
