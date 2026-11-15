# One way to address a package's own source

## Why

Every package and the repo-root `scripts` reach their own files through the subpath imports their manifest declares (`#src/*`), which Node, Vite, TypeScript and every bundler resolve alike. The web app is the one exception: it reaches its trees through the aliases Nuxt generates into its tsconfigs (`@/`, `@@/`, `#shared/`, `#server/`), which Node does not read. So every script under `apps/web/scripts` runs under `vpx --tsconfig tsconfig.root.json` rather than `node`, and the repository keeps a second runner for that reason alone. Once the web app declares its trees in its manifest like every package, no script needs `vpx`.

## What Changes

- The web app's manifest declares `#src/*` (its `app/` source), `#shared/*`, `#server/*`, `#scripts/*` and `#configuration/*`, and a name for each root file a module imports.
- **BREAKING** Every `@/` and `@@/` specifier in the web app becomes its `#` name, in one codemod commit with the import order the lint fixes; the lint bans `@/`, `@@/`, `~/` and `~~/` in the app as it bans `@/` in a package.
- Nuxt's own `#shared` and `#server` aliases and the manifest's entries of the same names are held to one target.
- Every script runs under `node`; a `.ts` script entry run by `vpx` fails the package-scripts test.
- Before any of it, a probe proves that every tool reading the app resolves the map.

## Capabilities

### New Capabilities

- `package-imports`: how a package, the web app included, addresses its own source.

## Impact

`apps/web/package.json`, every module under `apps/web` that imports through `@/` or `@@/`, `oxlint.config.ts`'s import ban, `scripts/src/workspace/packageScripts.test.ts`, the web app's script entries, and the file-organization and package-scripts skills.
