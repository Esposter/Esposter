# Running a TypeScript Script

Read when adding a `.ts` script to a package or choosing what runs it. The rule itself is in `SKILL.md` — `node`
where it can, `vpx` where it cannot, and the code is never bent to fit `node`; this page is where the line falls.

## `node` where it can, `vpx` where it cannot

Node strips types natively and runs a plain `.ts` file with no loader and no devDependency, so a new script is
`node path/to/index.ts` first. Syntax that stripping cannot erase never reaches it: `erasableSyntaxOnly` refuses it in the
typecheck, and a closed set is an `as const` object (the `typescript` skill, `references/value-sets.md`). What its
resolution cannot do, each of which moves the script to `vpx`:

- **A tsconfig `paths` alias** — node resolves `imports` subpaths and nothing else, so `@/models/…` is a bare
  specifier it goes looking for in `node_modules`. `apps/web/scripts/*` reaches app source through the
  Nuxt-generated `@/*`, `@@/*` and `#shared/*`, so every script there runs under `vpx --tsconfig tsconfig.root.json`.
- **An extensionless relative import** (`../src/constants`) — node wants the extension, vpx does not. Banned
  anyway, since a script addresses its package through `#src/*` (the `file-organization` skill, `references/import-aliases.md`).

**The code is never bent to reach `node`.** A relative path written where the alias belonged is a convention bent to suit a loader; the runner is picked to fit the code, so the
script that needs one of these runs under `vpx`, the bin of the root's `vite-plus` devDependency that every workspace script finds on its PATH, so no package declares a runner of its own. A script
already on `node` moves the day an import it reaches — its own or one several hops away — gains an alias, which
is a startup crash rather than a type error; `scripts/src/workspace/packageScripts.test.ts` strips every module a
`node` entry reaches with node's own stripper, and fails naming the first module it cannot run in each script. The root declares none: it owns no `.ts` script of its own, and
each `graph:gen`/`outdated:dependencies`/`ai:*` name there is a bare `pnpm -C <package> <name>` delegation to the package
that does: `scripts`, or `apps/web` for `ai:unocss:generate`.

**The same holds where no package script runs the file.** Where the tool runs a bare `node <path>` — a plugin's hooks
and commands — the file must run under `node` alone, so it reaches its siblings through `imports` subpaths and
relative paths with their extensions, and the persona plugin's copy of `genshin-text` is the source byte for byte with
only its alias re-aimed.

The `db:*` scripts call the `drizzle-kit` bin, which loads `drizzle.config.ts` and the schema itself — there is no
loader to choose. `db:migrate` names `node_modules/drizzle-kit/bin.cjs`, the only bin the installed drizzle-kit ships. The path
moves to `bin.js` in the release that ships drizzle-orm PR #6543, which builds drizzle-kit as ESM only (the manifest's
`"scriptsComments"` TODO carries the link).
