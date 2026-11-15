# Tasks

## 1. The probe

- [x] 1.1 Declare the web app's `imports` and convert one chain per tree (one app module, one shared, one server, one script and one test's `vi.mock`), then prove each reader resolves them: Nuxt's dev server and production build, Nitro's Workers build, Vitest, the app's typecheck, oxlint's import resolution, and `node` running the converted script. A reader that fails stops the change, and its finding becomes a decision in the design before any codemod runs. All passed; the probe's findings (folder indexes, asset extensions, globs, root files, the flow map's alias table) are decisions in the design.
- [ ] 1.2 Extend the probe to what 1.1 converted none of: one asset per kind with and without a `?raw` or `?url` suffix, a folder index written `/index`, and one `import.meta.glob` through `#src`, each through Nuxt's production build and Vitest. A reader that fails becomes a decision before the codemod.

## 2. The conversion

- [ ] 2.1 One codemod commit rewrites every `@/` and `@@/` specifier in the web app (static, dynamic, `vi.mock` paths and Vite globs) to its `#` name, appending `/index` to every specifier naming a folder (`#server/` included), adding a manifest pattern for each extension it meets, and keying the flow map's alias table by the new names, with the import order `oxlint --fix` writes, and the lint bans `@/`, `@@/`, `~/` and `~~/` there, for 'An alias import in the web app'. The codemod commit is reviewed locally and pushed straight to `main` (the review-queue skill's codemod case) after the app's typecheck and suite pass locally; the lint ban is its own commit through the queue.
- [ ] 2.2 A test in `apps/web/configuration` resolves `#shared` and `#server` through Nuxt's aliases and through the manifest. Verified for the scenario 'Nuxt and Node resolving one name', seen failing with one target moved.

## 3. One runner

- [ ] 3.1 Every web app script entry runs under `node`, for 'A web app script run by bare Node', held by `scripts/src/workspace/packageScripts.test.ts` stripping each entry's modules. That test's import walk follows only `#src/` today and skips any specifier whose file it cannot find: this task extends it to follow every `imports` entry the entry's own package declares, and fails an unresolved one, before the first web app entry moves.
- [ ] 3.2 `scripts/src/workspace/packageScripts.test.ts` fails a `.ts` script entry run by `vpx`. Verified for the scenario 'A script entry running TypeScript through another loader', seen failing on a `vpx` entry left in place; the file-organization skill's alias map and the package-scripts skill's runner rule are rewritten for the one way.
