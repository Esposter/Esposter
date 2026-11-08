# Tasks

## 1. The build

- [x] 1.1 The base factory builds unbundled and names the vendor folder, and the Vue factory splits each component's stylesheet. Verify: `vp run build:packages` builds every package with `publint` and `attw` clean, and the workspace tests for the published files, the side effects and the subpaths pass.
- [x] 1.2 The size record rolls the modules of one package and extension into one row. Verify: `rollUpBundleSizes.test.ts` passes, and `bundleSizes.test.ts` passes against the regenerated record.

## 2. The consumers

- [x] 2.1 The Functions bundle and the web app build against the unbundled packages. Verify: `pnpm -C apps/functions build` and `pnpm -C apps/web build` succeed, and the regenerated record moves the apps' rows only by what tree-shaking dropped.
- [x] 2.2 An import of one enum from the schema package loads no drizzle. Verify: the test 'an import of one enum loads no drizzle' in `scripts/src/workspace/unbundledBarrels.test.ts` passes against the unbundled build and fails against the schema package built into one file.

## 3. The Vue packages

- [x] 3.1 The Vue packages build unbundled with each component's stylesheet beside its module, and the app's CSS list drops the two package sheets. Verify: `vp run build:genshin-interface` and `vp run build:genshin-world` pass with `publint` and `attw` clean and no `./style.css` in either manifest, and `pnpm -C apps/web build` succeeds.

## 4. The workarounds

- [x] 4.1 Measure the app's client chunk after this change with `pnpm ai:dependencies:score --sort bundle --analyze`, and settle the architecture roadmap's client bundle item: the second-definition question over the drizzle-bound names, and no subpath for the rest. Verify: the roadmap item names the measured chunk and the decision.
- [x] 4.2 Audit every package's subpaths against the two rules, and narrow the wildcards that exported more than a consumer names. Verify: the subpath audit test passes. The roadmap's proposed client schema entry and `jsonDateParse` subpath are never added. `configuration` exports only `types/global.d.ts`, `genshin-interface` only the six stylesheets another package names, and `genshin-world` only the nine parity shapes the scripts import as types. Every other subpath serves a consumer with no bundler or a load by path (`.agents/skills/build/references/subpaths.md`, "Worked decisions").

## 5. The pages

- [x] 5.1 The build pages state the unbundled shape: the barrels page, the dist-size page, the subpaths page and the build-pipeline design. Verify: no page says a package builds into one file, and the spec tests pass.
