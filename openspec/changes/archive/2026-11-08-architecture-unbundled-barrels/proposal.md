# Unbundled barrels

## Why

A package builds into one `dist/index.js`. A consumer's bundler treats one file as one module, so importing one export keeps every top-level call the file makes, and a call such as a drizzle `pgTable`, a schema derived from it or a helper that builds a parser is one the bundler cannot prove pure. Probed through Vite, one enum from the schema package pulled in over a megabyte of drizzle and zod, and one small helper from the shared package pulled in tens of kilobytes.

The roadmap's answers to this are all entries added to dodge one cause: a client schema entry, a subpath for one helper, lazy imports of single libraries. Each entry is one more thing to keep in step with the code, and each leaves the next heavy import to be found by measuring a bundle.

## What changes

Every package builds unbundled: one output file per source module, with the root export and the generated barrel unchanged. `sideEffects: false` then lets a consumer drop every module no import reaches, and the one-export-per-file rule makes the module the right grain. A vendored dependency's files are written under `vendor` with no hidden folder in their path, since `npm pack` never ships a folder named `node_modules` and an artifact upload skips a hidden one. A Vue package keeps one `style.css` and no module imports a stylesheet, since Node loads the package's `dist` too, and answers `sideEffects` with the stylesheet glob. The Functions app and the infrastructure program stay one file, since nothing prunes them. The bundle-size record rolls a package's modules into one row per extension.

The same probe over the unbundled schema package puts that enum under a kilobyte, and the shared helper under a kilobyte. What stays heavy is what needs drizzle at run time: the message entity classes and the schemas drizzle derives from a table. The roadmap's second-definition question narrows to those names.

## Impact

- `@esposter/configuration`: the base factory builds unbundled and names the vendor folder; the Vue factory keeps one `style.css`.
- Every package: `dist` holds one file per module, and the bundle-size record changes shape.
- The roadmap item for the client bundle, and the subpaths that existed only to dodge the cause.
