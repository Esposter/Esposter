# Creating a new workspace package

Read when adding a package under `packages/`, adding a `bin` entrypoint, or deciding between `peerDependencies` and `dependencies`.

New packages follow existing patterns (e.g. `packages/db`, `packages/db-mock`):

1. **`package.json`** — set `name`, `private: true` (internal) or omit (publishable), `"type": "module"`, `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, `"files": ["dist"]`. Standard scripts: `build` (`pnpm export:gen && rolldown --config rolldown.config.ts`), `export:gen`, `format`, `format:check`, `lint`, `lint:fix`, `typecheck`. If it has tests, add a `test` script + `vitest`/`@types/node` devDeps and an `src/index.test.ts` bundle-size snapshot (see the `testing` skill). Coverage runs only from the repo root, so don't add a per-package `coverage` script or `@vitest/coverage-v8`.
2. **`tsconfig.json`** — `{ "extends": "../configuration/tsconfig.node.json" }` (node) or `"../configuration/tsconfig.vue.json"` (browser/Vue).
3. **`tsconfig.build.json`** — `{ "extends": ["./tsconfig.json", "../configuration/tsconfig.build.base.json"] }`.
4. **`rolldown.config.ts`** — call the matching factory from `@esposter/configuration`: `getRolldownConfigurationNode()` (server-only), `getRolldownConfigurationBrowser()`, or `getRolldownConfigurationIsomorphic()`. They are functions, not constants. See the `build` skill.
5. **`eslint.config.js`** — symlink to the shared config (`index.typescript.js` for TS-only, `index.vue.js` for Vue), created per the SKILL's symlink rule:
   ```powershell
   New-Item -ItemType SymbolicLink -Path "packages\db-mock\eslint.config.js" -Target "..\configuration\eslint\index.typescript.js"
   ```
   No per-package `.oxlintrc.json` — oxlint runs once from the repo root against the single root `.oxlintrc.json`.
6. **`src/index.ts`** — minimal barrel; `ctix` regenerates it on `pnpm export:gen`.
7. **Run plain `pnpm i`** from repo root to link the package. Follow `packages/app/content/docs/architecture/monorepo-tooling.md` for install safety.
8. **Run `pnpm build`** in the new package to produce `dist/`.

## Bin entrypoints — no shebang

Don't add `#!/usr/bin/env node` to source files, including `bin` entrypoints (`src/cli.ts`). pnpm generates the bin shim that invokes `node` for the target, so the shebang is dead weight. Only add one if a file is genuinely meant to be executed directly (`chmod +x ./file`), which workspace bins are not.

## Rolldown externals

Nothing to configure: `getExternal()` derives the external array from the new package's own `peerDependencies` plus its workspace siblings. Declare the peer in `package.json` and it is externalized. See the `build` skill for the two kinds of package that override this in their own `rolldown.config.ts`.

## peerDependencies vs dependencies

Use `peerDependencies` for packages that:

- Are direct runtime imports or generated `.d.ts` imports that should not be bundled into dist.
- Are framework/runtime singletons, SDKs mirrored in public APIs, or heavy/plugin runtimes the consumer must provide (`vue`, `pinia`, Azure SDKs, `drizzle-orm`, `zod`, `drizzle-kit`, `@electric-sql/pglite`).
- Are owned by the package that directly imports them. Don't redeclare transitive-only peers from imported workspace packages.

Use `dependencies` for direct runtime imports that are not consumer-provided and must be bundled/auto-installed. Workspace packages imported at runtime usually stay in `dependencies`.

**Example — `packages/db-mock`**, a test-only node package: `@electric-sql/pglite` is a peer (heavy, not bundled, loaded at runtime by `createMockDb`) and is in the shared `external` list; `drizzle-kit` is a `devDependency` only, used by `packages/db-mock/scripts/generateSnapshot.ts` (regenerates the committed `src/snapshot.tar.gz` via `pnpm snapshot:gen`) and the verification test, not the shipped `createMockDb` runtime; `eslint.config.js` symlinks to `../configuration/eslint/index.typescript.js`.
