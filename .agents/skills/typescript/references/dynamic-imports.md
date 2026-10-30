# Dynamic Imports

Read when reaching for `await import(...)`, or when a dependency's docs mention `optimizeDeps`. The rule itself is
in `SKILL.md` (never a dynamic import for code-splitting; always a static top-level `import`); this page is why,
and the two exceptions.

**Never `await import(...)` for code-splitting** — always a static top-level `import`. The build already
chunk-splits per component, so a nested dynamic import only hides the dependency and, in dev, defers Vite's
discovery until first use, which can trigger a mid-session re-optimization leaving chunks on stale dep hashes.
Only touch `optimizeDeps` when the dependency's own docs instruct it, or when a lazily mounted tree is what the optimiser
finds mid-session: `apps/web/configuration/vite.ts` lists the Genshin world's and the login's imports for that, since a
lazy component's own imports are found only as it mounts and each late find re-runs the optimiser.

`no-restricted-syntax` (`packages/configuration/eslint/restrictedSourceSyntaxes.js`) flags `await import(...)` in source;
tests are exempt. Two exceptions, each with a cause outside the repository: a library-mandated lazy-loader contract
(codemirror's `LanguageDescription.load`, in `apps/web/app/services/codemirror/constants.ts`), and a heavy dependency
reached only through a module the app always loads. The second's cause is the bundler: a statically imported module
is bundled into the chunk of the module that imports it, and the build splits only at a dynamic `import()`. The xlsx
parsers `read-excel-file/browser` and `write-excel-file/browser` are reached through the format map in
`apps/web/app/services/resource/sheet/dataSource/DataSourceConfigurationMap.ts`, which the command bar reaches on every
resource page, so a static import would put both parsers in that eager chunk. Each exception is a
`// eslint-disable-next-line no-restricted-syntax -- <reason>` directly above the import, and the reason says what it
keeps out of the eager graph (or why the import must be lazy). A generated map of lazy loaders is the one place a
directive is file-level instead: `GameTextLoaderMap` and `CharacterLinesLoaderMap` (`genshin-text`, `genshin-persona`)
and `CharacterIdCreateKitBehaviourMap` (`genshin-world`) each carry `/* eslint-disable no-restricted-syntax -- <reason> */`
on their first lines, emitted by their generators, since every entry of such a map is a lazy loader.
