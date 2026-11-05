# Dependency Placement

Read when adding, moving or removing a dependency in a manifest, or deciding whether one is bundled. The one-line rules are in `SKILL.md`; this page is each manifest field's meaning and what a removal owes.

tsdown externalizes `dependencies` and `peerDependencies` and bundles `devDependencies` that the source imports. That is already the right answer, so **the thing you edit is the manifest, not the config**:

- `dependencies` → externalized. The consumer's package manager installs them transitively; nobody types their names, and they dedupe against the rest of the consumer's tree.
- `peerDependencies` → externalized, and additionally a demand on the consumer. Reserve them for things that must be a single instance — framework singletons such as `vue` and `pinia`, and the Drizzle and Pulumi runtimes. A dependency that merely appears in a signature does not need to be a peer.
- `optionalDependencies` → externalized, and the only kind that may be absent at runtime: the consumer installs one when their platform allows it. Reach for it behind a check, never as though it resolved. `peerDependenciesMeta` is read the same way, so a name appearing only there is external too — both are in the `onlyImport` allowlist for that reason.
- `devDependencies` → build, lint, test, codegen and typecheck tooling, plus anything a self-contained bundle deliberately vendors.
- Don't redeclare a transitive peer. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is db-schema's peer, not azure-mock's.

**Never bundle a dependency to save the consumer an install.** It saves nothing — they never install it by hand — and it costs deduplication, it strands them on a vendored copy when that dependency ships a fix, and it splits any type the dependency owns into two nominally distinct copies that fail `instanceof` against each other.

**A manifest lists what its own code imports, and nothing it only reaches through another package.** A transitive dependency is never declared to make a bundler, a plugin or a pre-bundle list resolve it — name it through its importer (Vite's `importer > dependency` form) instead — and a package goes from the manifest and the catalog in the same change as its last importer, with every build entry, plugin branch and doc line that existed for it. `vp run lint:unused` (knip, part of CI's lint) is the check, and it has a blind spot: a package named in configuration — a Vite pre-bundle list, a plugin's path match — reads to it as used, so it outlives its last importer with the check green. So removing a library owes a search of the configuration for the packages it brought, not only a green knip.

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. The exception is an optional peer, one `peerDependenciesMeta` marks `optional`: pnpm leaves those out, so a package whose own tests import one lists it under `devDependencies` too. `scripts/src/workspace/peerDependencies.test.ts` fails on a required peer listed twice. Which imports have to be peers in the first place is the list above.

## Where a tool lives: the root or the package

**A tool that checks or runs the whole workspace is listed once, in the root manifest; a tool a package's own build names is listed in that package.** `typescript`, `tsrs`, `oxlint`, `eslint`, `knip` and `vize` are the first kind: a package's `typecheck` script is `tsrs --fast`, with `--runExternalCode` where the package holds `.vue` files, and the package lists none of them, since pnpm puts the root's binaries on the path of every workspace script and one version serves every package. `tsdown` is the second kind: it builds the package, so each package that builds lists it, and the declaration build's `tsrs` generator needs no listing of its own. `vitest` is the first kind too: the root lists it to run the workspace's suites, and a package's test files import it from that install without listing it, as the monorepo-tooling design has packages do. A package declares it only where a plugin it lists peers on it, and then an optional peer is listed under `devDependencies` as well, per the peer rule.

**A tool that loads a plugin by name resolves it from where the tool is installed, so the plugin and anything it must share with the project are root dependencies too.** `tsrs` loads `vize` from each package's `contentMappers`. The mapper compares the `vue` it resolves from the project with the `vue` it resolves from where `vize` is installed, and when they differ it falls back, silently, to helpers that lack what a library component's attributes need. The root therefore lists `vue` from the catalog beside `vize`. Listing `vue` in a library package would not help: the comparison is between the project and `vize`'s install, and a library is neither.

**Not settled by preference, so not reopened by it.** Per-package `vize` (each Vue package and the app listing `vize` and `vue` together) was weighed and not taken: it states a version of the tool in several manifests for a check that is already run from the root, and removes only two knip ignores. It becomes the right answer when a package must check with a different `vize` than the rest, which no package does.

## Patterns, not bare names

Anything handed to `deps` goes through `getPackagePatterns`. A bare name never matches a subpath import, and `drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm` and `vitest/node` are all reached only that way. A list passed verbatim misses exactly those and the failure looks like an unrelated missing export.
