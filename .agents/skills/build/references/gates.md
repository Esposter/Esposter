# The Build Gates

Read when `deps.onlyImport`, `publint` or `attw` fails a build, or when a consumer reports a module the package never referenced. The rule itself is in `SKILL.md` — a bundle leaves external only what its manifest names, and a published package is gated further; this page is what each gate catches and what the fix is.

## `deps.onlyImport` — every bundle's externals are gated

`deps.onlyImport` applies to **every** package: a bundle may leave external only what its own manifest names. It catches two different failures with one check.

- **A published package importing a _private_ sibling** passes every local check — the workspace has the sibling on disk — and resolves nothing on a fresh `npm install`. If it fires, the fix is to make the import legitimate (publish what it needs, or move the shared code somewhere published), never to widen the list.
- **A specifier that resolved to nothing.** Rolldown externalizes an unresolvable `#src/...` rather than failing, so the `dist` ships an import Node then resolves through the package's own `imports` map to a `.ts` file it cannot load. That surfaces in a _consumer_, at runtime, naming a source path the consumer never referenced — `Cannot find module .../packages/db-schema/src/services/missing.ts imported from .../db-schema/dist/index.js`. The gate turns it into a build error in the package that caused it.

`@esposter/configuration` is the one package that widens the list, because everything it externalizes is a `devDependency` and the base derives the allowlist from the runtime fields only.

`deps.onlyImport` checks that imports are declared. It cannot check that a declared dependency is actually _publishable_, and neither can publint — a private sibling sitting in `dependencies` is declared, well-formed, and still ships a package that resolves nothing on a stranger's `npm install`. That edge is the one thing about the manifest no build gate can see, so `scripts/src/workspace/publishedDependencies.test.ts` asserts it instead: no published package names a private sibling in any field a consumer's package manager resolves.

## `publint` and `attw` — a published package is gated further

Absence of `private` in the manifest switches on `publint` and `attw`. Never disable one to get a build through — each marks a package that would fail on someone else's machine:

- `publint` — the manifest points at a file the package does not ship.
- `attw` — the declarations break under a resolution mode a consumer might use.
