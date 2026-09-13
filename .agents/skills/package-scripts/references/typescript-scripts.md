# Running a TypeScript Script

Read when adding a `.ts` script to a package, choosing what runs it, or writing a check CI has to run before an
install. The rule itself is in `SKILL.md` — `node` where it can, `tsx` where it cannot, and the code is never bent
to fit `node`; this page is where the line falls and where a pre-install check goes instead.

## `node` where it can, `tsx` where it cannot

Node strips types natively and runs a plain `.ts` file with no loader and no devDependency, so a new script is
`node path/to/index.ts` first. Three things its stripping cannot do, and each one moves the script to `tsx`:

- **An `enum`** — stripping cannot transform one, and the script dies at startup with
  `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. An enum is this repo's default shape for a categorical value (`typescript`
  skill), so this is the common trigger.
- **A tsconfig `paths` alias** — node resolves `imports` subpaths and nothing else, so `@/models/…` is a bare
  specifier it goes looking for in `node_modules`. `apps/web/scripts/*` reaches app source through the
  Nuxt-generated `@/*`, `@@/*` and `#shared/*`, so both of them (`phaser:gen` and `tiled:gen`) pass
  `--tsconfig tsconfig.root.json`.
- **An extensionless relative import** (`../src/constants`) — node wants the extension, tsx does not. Banned
  anyway, since a script addresses its package through `#src/*` (`file-organization`).

**The code is never bent to reach `node`.** A union written where the enum belonged, or a relative path written
where the alias belonged, is a convention bent to suit a loader; the runner is picked to fit the code, so the
script that needs one of the three declares `tsx` as a devDependency of its package — `scripts`, `apps/web` and
`packages/db-mock` do today — and runs under it. The root declares none: it owns no `.ts` script of its own, and
each `graph:gen`/`outdated:dependencies`/`ai:*` name there is a `pnpm -C scripts run` delegation to the package
that does.

`db:run` runs `drizzle-kit`'s CJS bin directly under `node` — the file is not TypeScript, so there was never a
loader to choose.

## A check that has to run before an install is CI's own shell

CI's package-build gate asks its question on a cache hit designed to need no install, so nothing under
`node_modules` can answer it. `node` could run a dependency-free `.ts` there, but the check is
`.github/actions/verify-package-builds`, bash that sits beside the bash computing the cache key in
`get-build-cache-keys`, and the day it grows an enum or an import it would need the install it exists to skip. A
few lines of bash beside the key is the shape that cannot drift into that.
