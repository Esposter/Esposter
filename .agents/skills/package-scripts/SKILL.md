---
name: package-scripts
description: Apply when running or recommending any pnpm script. Esposter's pnpm scripts — which script runs a check, a build, a bench or the release and from where; nuxt typecheck and the root lint as the only checks matching CI, a root check aggregating named leaves with run-s, the check suite once per chunk with tests scoped to the paths touched, and the pnpm traps (a --filter matching nothing exits 0, `pnpm <script> -- <args>` dropping the args, a workflow running the binary instead of the script) — plus the ai:* catalogue an agent runs.
---

# Package Scripts

`apps/web` scripts run from `apps/web/`; root scripts run from the repo root. Always `pnpm` — never `npm` or `npx`.

## Settled — do not re-propose

- **A root `build:<app>` script per app.** A root script that only delegates to a package is a second definition of the line at the call site; what earns a root script its line is `apps/web/content/docs/architecture/monorepo-tooling.md`, "Recursive script orchestration".
- **Majoring the published packages because an export was renamed or removed.** `lerna.json` is `conventionalCommits: true` in fixed mode, so a `BREAKING CHANGE:` footer moves every public package to the next whole number; a rename or a removal ships as the `refactor` it is, and a package is kept at its smallest form rather than its oldest surface (`apps/web/content/docs/architecture/no-compatibility-debt.md`).
- **Splitting the release into a local `lerna version` and a CI publish** through npm's trusted publishing. It buys an attestation nobody here asks for, at the price of a release path in two places and a per-package registration that fails closed on every new package; one script run locally is the whole release (`apps/web/content/docs/architecture/monorepo-tooling.md`, "Lerna Lite").

## `apps/web`

**`nuxt typecheck` is the only typecheck, and root `pnpm lint` the only lint** — the binaries under them check strictly less than CI; a root check aggregates named leaves with `run-s --continue-on-error`, never `&&`; and `oxfmt` formats markdown tables too (`references/app-scripts.md`).

## Root Scripts — `references/root-scripts.md`

`pnpm i` after a manifest change, `pnpm test` for the whole suite once (the ban on running it locally is the `testing` skill's), `build:packages` for the libraries as a set, `pnpm release` for the whole release, and `pnpm lint:unused` for knip; the `ai:<domain>:<verb>` scripts no human types are `references/ai-scripts.md`.

## A `.ts` script runs under `node` where it can, `tsx` where it cannot — `references/typescript-scripts.md`

Node strips types natively; an `enum`, a tsconfig alias or an extensionless import moves the script to `tsx`, and the code is never bent to fit `node`.

## `scriptsComments` — `references/scripts-comments.md`

A script that records something to undo later carries one `@TODO:` string in a sibling top-level `scriptsComments` object — never a `"// …"` key inside `scripts`, which pnpm lists as runnable (`scripts/src/workspace/packageScripts.test.ts`).

## Check Suite (after edits)

Once per coherent chunk: `pnpm typecheck`, **root** `pnpm lint:fix`, and the tests of what the change touched as package-relative paths — never the whole suite (`references/check-suite.md`, the `running-checks` skill).

## Key Rules

- **A `--filter` that matches nothing exits 0** — prefer `pnpm -C <dir>`, and treat a filtered check's empty output as "it did not run" until a real compiler banner or test count proves otherwise.
- **Never `pnpm <script> -- <args>`** — pnpm forwards the literal `--` and the flags are dropped; pass them as direct args (`pnpm test -u`).
- **A caller runs the script, not the binary under it** — `pnpm exec <binary>` in a workflow is a second definition that drifts; where no script has the shape, add one (`bench:ci`).
- **A script is invoked bare — `pnpm <script>`, never `pnpm run <script>`** — including under `-C` and `--filter`. `run` is load-bearing only for a name that shadows a pnpm command; `scripts/src/workspace/packageScripts.test.ts` fails on any other inside a manifest, so a workflow or a doc is where the collision is still spotted by eye.
- **A suite that shells out to `git` cannot run under root `pnpm test` on Windows** — virrun reaches the checkout through WSL, where git refuses to discover the repository, so every `scripts/src/workspace` suite fails on a clean tree; run it as `pnpm -C scripts test <path> --run`.
- How each fails, and the name that shadows a pnpm command: `references/pnpm-traps.md`.

## Reference pages

- `references/app-scripts.md` — when running a script from `apps/web`, or reaching for the binary under one.
- `references/check-suite.md` — when a chunk's checks are owed: the scripts, the directory, the test paths.
- `references/root-scripts.md` — when choosing which root script runs a build, the suite, a bench, a dependency report or the release.
- `references/ai-scripts.md` — when a sweep, a review or a skill needs the script that runs its scan.
- `references/typescript-scripts.md` — when adding a `.ts` script, choosing its runner, or writing a check CI runs before an install.
- `references/scripts-comments.md` — when a script is shaped by something that should later be undone.
- `references/pnpm-traps.md` — when a filtered check passes too quickly, flags are forwarded through a script, or a `run` prefix is in question.
