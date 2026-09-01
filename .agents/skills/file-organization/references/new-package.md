# Creating a new workspace package

Read when adding a package under `packages/`, adding a `bin` entrypoint, or deciding between `peerDependencies` and `dependencies`.

New packages follow existing patterns (e.g. `packages/db`, `packages/db-mock`):

1. **`package.json`** — set `name`, `private: true` (internal) or omit (publishable), `"type": "module"`, `"types": "dist/index.d.ts"`, `"files": ["dist"]`, `"sideEffects": false` if it genuinely has none (the build generates `exports`). Standard scripts: `build` (bare `tsdown` — the shared factory generates the barrel from a `build:prepare` hook), `export:gen` (`generate-exports`, or `generate-exports vue`), `format`, `format:check`, `lint`, `lint:fix`, `typecheck`. If it has tests, add a `test` script + `vitest`/`@types/node` devDeps and an `src/index.test.ts` bundle-size snapshot (see the `testing` skill). Coverage runs only from the repo root, so don't add a per-package `coverage` script or `@vitest/coverage-v8`.
2. **`tsconfig.json`** — `{ "extends": "../configuration/tsconfig.node.json" }` (node) or `"../configuration/tsconfig.vue.json"` (browser/Vue).
3. **`tsconfig.build.json`** — `{ "extends": ["./tsconfig.json", "../configuration/tsconfig.build.base.json"] }`.
4. **`tsdown.config.ts`** — call the matching factory from `@esposter/configuration`: `getTsdownConfigurationNode()` (server-only), `getTsdownConfiguration()` (platform-neutral), or `getTsdownConfigurationVue()`. They are functions, not constants, and are composed with `mergeConfig` rather than a spread. See the `build` skill.
5. **`eslint.config.js`** — a one-line re-export of the shared config (`index.typescript.js` for TS-only, `index.vue.js` for Vue), never a symlink (see the SKILL's symlink rule):
   ```js
   export { default } from "@esposter/configuration/eslint/index.typescript.js";
   ```
   No per-package `.oxlintrc.json` — oxlint runs once from the repo root against the single root `.oxlintrc.json`.
6. **`src/index.ts`** — generated, never written by hand or committed; `pnpm build` runs `ctix` over the package, and `pnpm export:gen` runs it alone.
7. **Run plain `pnpm i`** from repo root to link the package. Follow `packages/app/content/docs/architecture/monorepo-tooling.md` for install safety.
8. **Run `pnpm build`** in the new package to produce `dist/`.

## Bin entrypoints — no shebang

Don't add `#!/usr/bin/env node` to source files, including `bin` entrypoints (`src/cli.ts`). pnpm generates the bin shim that invokes `node` for the target, so the shebang is dead weight. Only add one if a file is genuinely meant to be executed directly (`chmod +x ./file`), which workspace bins are not.

A `bin` field points at a committed one-line `bin/*.js` that imports the built entry, never at `dist` itself: pnpm refuses to link a shim whose target is missing at install time, and `dist` is gitignored, so a fresh clone would install with no shim at all. Don't guard that import. A bin is reachable before `build:packages` has run, and Node's own `ERR_MODULE_NOT_FOUND` already names the missing `dist` file and the wrapper that imported it — a hand-written check buys the exact build command and costs the same lines in every wrapper, which cannot share them because they run before there is anything importable to share.

## Externals

Nothing to configure: tsdown externalizes `dependencies` and `peerDependencies` and bundles the `devDependencies` the source imports. Declare it in `package.json` and the placement decides. See the `build` skill for the two kinds of package that override this in their own `tsdown.config.ts`.

## peerDependencies vs dependencies

Use `peerDependencies` for packages that:

- Are direct runtime imports or generated `.d.ts` imports that should not be bundled into dist.
- Are framework/runtime singletons, SDKs mirrored in public APIs, or heavy/plugin runtimes the consumer must provide (`vue`, `pinia`, Azure SDKs, `drizzle-orm`, `zod`, `drizzle-kit`, `@electric-sql/pglite`).
- Are owned by the package that directly imports them. Don't redeclare transitive-only peers from imported workspace packages.

Use `dependencies` for direct runtime imports that are not consumer-provided and must be bundled/auto-installed. Workspace packages imported at runtime usually stay in `dependencies`.

**Example — `packages/db-mock`**, a test-only node package: `@electric-sql/pglite` is a peer (heavy, not bundled, loaded at runtime by `createMockDb`) and is in the shared `external` list; `drizzle-kit` is a `devDependency` only, used by `packages/db-mock/scripts/generateSnapshot.ts` (regenerates the committed `src/snapshot.tar.gz` via `pnpm snapshot:gen`) and the verification test, not the shipped `createMockDb` runtime; `eslint.config.js` re-exports `@esposter/configuration/eslint/index.typescript.js`.
