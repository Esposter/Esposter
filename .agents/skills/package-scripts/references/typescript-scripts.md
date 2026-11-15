# Running a TypeScript Script

Read when adding a `.ts` script to a package or choosing what runs it. The rule itself is in `SKILL.md` — every `.ts` script
runs under `node`; this page is why nothing needs more, and what holds it.

## Every `.ts` script runs under `node`

Node strips types natively and runs a plain `.ts` file with no loader and no devDependency, so a script entry is
`node path/to/index.ts`. Nothing in the repository needs more: `erasableSyntaxOnly` keeps syntax stripping cannot erase
out of every file (a closed set is an `as const` object, the `typescript` skill's `references/value-sets.md`), and every
package — the web app included — reaches its own source through the subpath imports its manifest declares, each naming
its file (the `file-organization` skill, `references/import-aliases.md`). A relative import keeps its extension.

`scripts/src/workspace/packageScripts.test.ts` holds both halves: it walks every module a `node` entry reaches through
the importing file's own manifest, failing a specifier that resolves to no file or a module node cannot strip, and it
fails a `.ts` entry run by `vpx`. Neither failure is one a typecheck or lint reports; without it a script dies at
startup. The root declares no `.ts` script: each `graph:gen`/`outdated:dependencies`/`ai:*` name there is a bare
`pnpm -C <package> <name>` delegation to `scripts`, or `apps/web` for `ai:unocss:generate`.

**A plugin runs the same way.** Where the tool runs a bare `node <path>` — a plugin's hooks
and commands — the file must run under `node` alone, so it reaches its siblings through `imports` subpaths and
relative paths with their extensions, and the persona plugin's copy of `genshin-text` is the source byte for byte with
only its alias re-aimed.

The `db:*` scripts call the `drizzle-kit` bin, which loads `drizzle.config.ts` and the schema itself — there is no
loader to choose. `db:migrate` names `node_modules/drizzle-kit/bin.cjs`, the only bin the installed drizzle-kit ships. The path
moves to `bin.js` in the release that ships drizzle-orm PR #6543, which builds drizzle-kit as ESM only (the manifest's
`"scriptsComments"` TODO carries the link).
