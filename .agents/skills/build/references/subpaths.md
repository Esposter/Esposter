# Subpaths

Read when adding a subpath export or entry to a package, removing one, or a review asks why a package has one. The flat `.` export is the default (`references/barrels.md`); a subpath has to earn its place by one of the reasons below. `SKILL.md` says only that the default is the shape; this page is the test.

## A subpath earns its place by one of two things

1. **A consumer needs part of the package without the rest, and the rest costs it something.** The cost is concrete: a framework or peer it does not have (a Node script or a server importing a module that pulls in Vue), a heavy dependency, a bundle size a worker must stay under, or a browser-only or Node-only half a sibling must not load. Name the consumer. The `constants` subpath of `genshin-interface` and the `parity` subpaths of `genshin-world` are imported by `scripts/`, which runs in Node and cannot load the Vue components the root entry carries.
2. **The entry is loaded by path, not imported.** A worker loaded by URL, a bin's compiled file, a Nuxt module's runtime, a Vitest reporter or bench file. These need an entry in the build, and some need an export arm too (`genshin-engine/terrainWorker`, `shared-node/reporter`). The consumer names the file, so the entry is the contract.

If neither holds, the subpath is a duplicate or a leftover, and it goes.

## What never earns one

- **A re-export of what the root already exports.** A second bundle of the same functions is a second copy in every consumer that reaches both. `vue-pdfjs-headless/xfdf` was this: its bundle repeated `readXfdf` and `writeXfdf`, which the barrel already carried, and nothing imported the subpath.
- **"Framework-free" with no consumer that lacks the framework.** The wish to keep Vue out of a bundle is not a consumer. Name the consumer that needs it or leave the functions in the barrel.
- **A program exposed as an export.** A module with a top-level side effect (a `runMain` call, a server start) runs on import, so exporting it turns importing the package into running it. `generateExports.ts` already refuses to list a module with no export for this reason. A program is reached through a `bin` entry, which runs the built file, not an import specifier. `agent-console-server/cli` was one: its export is removed, and the entry stays because the bin runs `dist/cli.js`.

## What a kept subpath owes

- **An entry in `tsdown.config.ts`**, named for the `dist/<entry>.js` it builds to, a hand-written barrel at `src/<entry>.ts` or `src/<dir>/index.ts` (`references/barrels.md`, "A subpath entry is a hand-written barrel").
- **An export arm in `package.json`** — `source` and `default`, mirrored in `publishConfig.exports` — unless the entry is loaded by path (rule 2), in which case the arm may be absent.
- **A README line** naming the subpath and what a consumer gets from it.
- **A test for any "loads nothing from X" claim.** `pitch-transcription`'s `index.test.ts` asserts the `notes` subpath's graph has no `onnxruntime` specifier. A claim with no test is a claim the next import can break.
- **A size snapshot that moves with it** (`references/dist-size.md`).

## Removing one

Every published package is experimental (`openspec/specs/architecture/monorepo-tooling/design.md`, Stability), so a removed export is a changelog line in a minor release, not a breaking change. Check before removing: no repo consumer (`git grep` for the specifier across `apps`, `packages` and `scripts`), no README naming it, and the entry's own use (a bin or worker keeps its build entry even when the export goes).

A Nuxt module's runtime arms are generated from its unbundled runtime glob, so a removed arm is excluded in the package's `tsdown.config.ts` through `exports.exclude`. Editing `package.json` by hand is undone by the next build. The factory's `exports.exclude` already carries `runtime/**/services/**` (`packages/configuration/src/services/getTsdownConfigurationNuxtModule.ts`), and each config passes only its own arms as the factory's argument, so no config repeats the services entry.

## Worked decisions

| Package                                                   | Subpath                                     | Decision                   | Reason                                                                                                                                             |
| :-------------------------------------------------------- | :------------------------------------------ | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vue-pdfjs-headless`                                      | `xfdf`                                      | removed                    | rule 1 failed: no consumer, duplicated the barrel                                                                                                  |
| `agent-console-server`                                    | `cli`                                       | export removed, entry kept | the export ran a program on import; the bin runs `dist/cli.js` by path                                                                             |
| `vue-grid-layout-headless`                                | `placement`                                 | removed                    | no consumer once the dashboard moved to `useGridLayout`; every package is experimental, so the export goes in a minor release                      |
| `genshin-interface`                                       | `constants`, `save`                         | kept                       | Node scripts import them without the Vue root                                                                                                      |
| `agent-console-server`                                    | `contracts`                                 | kept                       | the web app imports the wire contract without the Node half                                                                                        |
| `trpc-nuxt-module`, `nuxt-security-module`, `tresjs-nuxt` | dozens of runtime arms                      | removed                    | the declarations import the model files relatively, and the modules register runtime files by resolved path; the files still ship                  |
| `trpc-nuxt-module`                                        | `runtime/server/createTRPCEventHandler`     | kept                       | the generated server template imports it by its bare specifier, which Nitro resolves through the `exports` arm; removing it breaks the app's build |
| `trpc-nuxt-module`                                        | `runtime/server/createTRPCWebSocketHandler` | kept                       | the generated WebSocket template imports it by its bare specifier the same way; its exclude was removed for that reason                            |
