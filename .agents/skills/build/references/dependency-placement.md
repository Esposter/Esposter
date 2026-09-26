# Dependency Placement

Read when adding, moving or removing a dependency in a manifest, or deciding whether one is bundled. The one-line rules are in `SKILL.md`; this page is each manifest field's meaning and what a removal owes.

tsdown externalizes `dependencies` and `peerDependencies` and bundles `devDependencies` that the source imports. That is already the right answer, so **the thing you edit is the manifest, not the config**:

- `dependencies` → externalized. The consumer's package manager installs them transitively; nobody types their names, and they dedupe against the rest of the consumer's tree.
- `peerDependencies` → externalized, and additionally a demand on the consumer. Reserve them for things that must be a single instance — framework singletons (`vue`, `pinia`), the Drizzle and Pulumi runtimes. A dependency that merely appears in a signature does not need to be a peer.
- `optionalDependencies` → externalized, and the only kind that may be absent at runtime: the consumer installs one when their platform allows it. Reach for it behind a check, never as though it resolved. `peerDependenciesMeta` is read the same way, so a name appearing only there is external too — both are in the `onlyImport` allowlist for that reason.
- `devDependencies` → build, lint, test, codegen and typecheck tooling, plus anything a self-contained bundle deliberately vendors.
- Don't redeclare a transitive peer. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is db-schema's peer, not azure-mock's.

**Never bundle a dependency to save the consumer an install.** It saves nothing — they never install it by hand — and it costs deduplication, it strands them on a vendored copy when that dependency ships a fix, and it splits any type the dependency owns into two nominally distinct copies that fail `instanceof` against each other.

**A manifest lists what its own code imports, and nothing it only reaches through another package.** A transitive dependency is never declared to make a bundler, a plugin or a pre-bundle list resolve it — name it through its importer (Vite's `importer > dependency` form) instead — and a package goes from the manifest and the catalog in the same change as its last importer, with every build entry, plugin branch and doc line that existed for it. `pnpm lint:unused` (knip, part of CI's lint) is the check, and it has a blind spot: a package named in configuration — a Vite pre-bundle list, a plugin's path match — reads to it as used, so it outlives its last importer with the check green. So removing a library owes a search of the configuration for the packages it brought, not only a green knip.

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. Which imports have to be peers in the first place is the list above.

## Patterns, not bare names

Anything handed to `deps` goes through `getPackagePatterns`. A bare name never matches a subpath import, and `drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm` and `vitest/node` are all reached only that way. A list passed verbatim misses exactly those and the failure looks like an unrelated missing export.
