# Subpaths

Read when adding a subpath export or entry to a package, removing one, or a review asks why a package has one. The flat `.` export is the default (`references/barrels.md`); a subpath has to earn its place by one of the reasons below. `SKILL.md` says only that the default is the shape; this page is the test.

## A subpath earns its place by one of two things

1. **A consumer needs part of the package without the rest, and the rest costs it something.** The cost is concrete: a framework or peer it does not have (a Node script or a server importing a module that pulls in Vue), a heavy dependency, a bundle size a worker must stay under, or a browser-only or Node-only half a sibling must not load. Name the consumer. The `constants` subpath of `genshin-interface` and the `parity` subpaths of `genshin-world` are imported by `scripts/`, which runs in Node and cannot load the Vue components the root entry carries. `genshin-engine/terrainWorker` is imported inside the terrain worker's own bundle, which must load none of the renderer.
2. **The entry is loaded by path, not imported.** A worker loaded by URL, a bin's compiled file, a Nuxt module's runtime, a Vitest reporter or bench file. These need an entry in the build, and some need an export arm too (`shared-node/reporter`). The consumer names the file, so the entry is the contract.

If neither holds, the subpath is a duplicate or a leftover, and it goes.

## A bundler's consumer never needs a subpath for weight

A package builds one output file per source module (`references/barrels.md`, "The build keeps the module graph"), and every manifest answers `sideEffects`, so a consumer's bundler loads only the modules an import reaches. A subpath that exists so a bundled client can skip the rest of the package therefore costs the package a second entry for a saving the root already gives. The cost that remains is a module that does real work when it loads, such as a table definition or a schema derived from one; that is the module's own weight, and the fix is to import the module that does not hold it, never a second entry.

The consumers that still need a subpath are the ones with no bundler to prune. Node loads every module a barrel re-exports, and it cannot load a stylesheet, a `.vue` file or a peer the consumer does not install, so a Node script or a server keeps the rule 1 subpath that leaves the framework out.

## What never earns one

- **A re-export of what the root already exports.** A second bundle of the same functions is a second copy in every consumer that reaches both the subpath and the root.
- **"Framework-free" with no consumer that lacks the framework.** The wish to keep Vue out of a bundle is not a consumer. Name the consumer that needs it or leave the functions in the barrel.
- **A program exposed as an export.** A module with a top-level side effect (a `runMain` call, a server start) runs on import, so exporting it turns importing the package into running it. `generateExports.ts` already refuses to list a module with no export for this reason. A program is reached through a `bin` entry, which runs the built file by path, so its build entry stays while no export names it.

## What a kept subpath owes

- **An entry in `tsdown.config.ts`**, named for the `dist/<entry>.js` it builds to, a hand-written barrel at `src/<entry>.ts` or `src/<dir>/index.ts` (`references/barrels.md`, "A subpath entry is a hand-written barrel").
- **An export arm in `package.json`** — `source` and `default`, mirrored in `publishConfig.exports` — unless the entry is loaded by path (rule 2), in which case the arm may be absent.
- **A README line** naming the subpath and what a consumer gets from it.
- **A test for any "loads nothing from X" claim.** `pitch-transcription`'s `index.test.ts` asserts the `notes` subpath's graph has no `onnxruntime` specifier. A claim with no test is a claim the next import can break.
- **A size the entry can move**, which `bundle-sizes.md` records (`references/dist-size.md`).

## Removing one

Every published package is experimental (`openspec/specs/architecture/monorepo-tooling/design.md`, Stability), so a removed export is a changelog line in a minor release, not a breaking change. Check before removing: no repo consumer (`git grep` for the specifier across `apps`, `packages` and `scripts`), no README naming it, and the entry's own use (a bin or worker keeps its build entry even when the export goes).

A Nuxt module's runtime arms are generated from its unbundled runtime glob, so a removed arm is excluded in the package's `tsdown.config.ts` through `exports.exclude`. Editing `package.json` by hand is undone by the next build. The factory's `exports.exclude` already carries `runtime/**/services/**` (`packages/configuration/src/services/getTsdownConfigurationNuxtModule.ts`), and each config passes only its own arms as the factory's argument, so no config repeats the services entry. Every Nuxt module's `runtime/constants` holds its `MODULE_NAME`, so each excludes it unless a file outside the package imports a constant from it, as `apps/web` does for `trpc-nuxt-module`'s hook names.

## Adding a runtime file

A Nuxt module's new runtime file gains an arm on the next build, so the manifest check of `build-packages` fails on the uncommitted field until the file is excluded in the package's `tsdown.config.ts` or a consumer names it. The generated field is never the thing to commit, since the subpath audit then finds no source that names the specifier.

## Worked decisions

| Package                                                   | Subpath                                         | Decision | Reason                                                                                                                                                                                                           |
| :-------------------------------------------------------- | :---------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vue-pdfjs-headless`                                      | `xfdf`                                          | removed  | rule 1 failed: no consumer, duplicated the barrel                                                                                                                                                                |
| `vue-grid-layout-headless`                                | `placement`                                     | removed  | no consumer once the dashboard moved to `useGridLayout`; every package is experimental, so the export goes in a minor release                                                                                    |
| `genshin-interface`                                       | `constants`, `save`                             | kept     | Node scripts import them without the Vue root                                                                                                                                                                    |
| `trpc-nuxt-module`, `nuxt-security-module`, `tresjs-nuxt` | dozens of runtime arms                          | removed  | the declarations import the model files relatively, and the modules register runtime files by resolved path; the files still ship                                                                                |
| `trpc-nuxt-module`                                        | `runtime/server/models/TRPCWebSocketConnection` | kept     | the app's plugin types the hook payload with it, and its generic carries the router's context; excluding it would have the app restate the shape, with no runtime saving since it is a type                      |
| `shared-node`                                             | `bench`, `cache`, `child-process`, `reporter`   | kept     | a package with no root has no barrel to duplicate: each entry is the package's API, its consumers are Node scripts and Vitest, and `child-process` is also the one place a lint rule allows `node:child_process` |
| `configuration`                                           | `types/*`                                       | narrowed | only `types/global.d.ts` is named by a consumer, the app; every package reaches the folder by a relative tsconfig glob, which a file's name does not change                                                      |
| `genshin-interface`                                       | `styles/*.css`                                  | narrowed | only the six stylesheets another package's `<style src>` names are exported and copied; the rest are read from the package's own source by its own components                                                    |
| `genshin-world`                                           | `parity/*`                                      | narrowed | the wildcard exposed every module of the parity page, one of which writes to `window` when loaded; only the shapes the scripts import as types have an arm                                                       |
| `genshin-interface`, `genshin-world`                      | `style.css`                                     | removed  | each component's module imports its own stylesheet and the package answers `sideEffects` with its stylesheets, so a page loads only the styles of the components it reaches                                      |
| `trpc-nuxt-module`                                        | `runtime/server/createTRPCEventHandler`         | kept     | the generated server template imports it by its bare specifier, which Nitro resolves through the `exports` arm; removing it breaks the app's build                                                               |
| `trpc-nuxt-module`                                        | `runtime/server/createTRPCWebSocketHandler`     | kept     | the generated WebSocket template imports it by its bare specifier the same way; its exclude was removed for that reason                                                                                          |
