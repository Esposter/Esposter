---
name: build
description: Esposter tsdown build conventions — a Settled list of the directions already tried and rejected (finishing the source split onto the app's bundlers or its Vitest project, devExports true in place of the condition name, a repo-namespaced condition, a hand-maintained onlyBundle allowlist, a guard skipping barrel generation, speeding the build up by cheapening ctix or raising concurrency, vendoring CJS as a policy, bundling to spare a consumer an install, and compilerOptions or paths returning to the base tsconfigs), the shared configuration factories and composing them with mergeConfig rather than a spread, dependencies being externalized while devDependencies are bundled, subpath-aware package patterns, inlinedDependencies as the record of what a bundle swallowed, every package declaring sideEffects and the one kind that claims true, the publint/attw/onlyImport gates a published package gets and why a private one gets none, and the dist size snapshot as the correctness signal — plus deep dives on barrel generation, the three opt-outs (minify, vendoring, a host-read entry field), the #src/ self-alias and the source export condition, ambient declarations and module augmentations that a bundle cannot carry, and the tsconfig presets with the bootstrap package. Apply when adding packages, editing tsdown or tsconfig configs, changing a manifest's dependency placement, or wrapping a library whose types are augmented by a plugin.
---

# Build Conventions (tsdown)

The mechanism — what runs, in what order, and why — is `packages/app/content/docs/architecture/build-pipeline.md`. This skill is the conventions you apply when editing it.

## Settled — do not re-propose

Every line here is a direction a reader reaches for on meeting the rules below. Each was tried or considered; the argument is where the line points.

- **Finishing the source split** — giving the app's Vite and Nitro builds, or its Vitest project, the `source` condition so an edit to a sibling needs no rebuild. Every workspace package's TypeScript then joins one graph, the server bundle stops externalizing its siblings, and the package whose stores rely on its own build's auto-import injection breaks outright. Reach for `watch:packages` (`references/source-exports.md`).
- **`devExports: true`** in place of the condition name, the two-arm map reading as needless configuration. It points every condition at source, and Node's own loader reads no TypeScript, so the prerender and the infrastructure program die a phase away from the change (`references/source-exports.md`).
- **A repo-namespaced condition** (`esposter-source`), to stop a stranger's resolver matching the arm. Nothing published carries a source arm at all (`references/source-exports.md`).
- **A hand-maintained `onlyBundle` allowlist**, to answer tsdown's standing hint. `inlinedDependencies` already records every vendored package in a reviewed diff, and the check runs before the manifest is written, so a new package's first build could never pass (`references/opt-outs.md`).
- **A guard that skips barrel generation on a hash of the file list.** ctix drops _both_ files when two export the same identifier, so a colliding rename changes the output while moving no path and flipping no export bit — and a key sound enough to see it buys nothing the `package-builds` cache does not already give (`references/barrels.md`).
- **Making barrel generation cheaper, or building the packages more concurrently.** ctix loads a TypeScript program per package and offers no flag that avoids one, so it is roughly nine tenths of a package's build and its cost tracks that package's _dependency_ type surface rather than its own file count — the package pulling in the largest provider types is the slowest one here despite being far from the largest. Concurrency is not the lever either: the wall time is one topological chain, because a sibling's `source` arm points at its generated — and gitignored — barrel, so a worker count past what the graph allows was measured to change nothing. What already answers this is the `build:prepare` hook, the `package-builds` content cache, and `watch:packages` for the dev loop (`references/barrels.md`).
- **Vendoring CJS dependencies as a policy.** It is a named exception per dependency; generalised it vendors the same library into half the dists here (`references/opt-outs.md`).
- **Bundling a dependency to spare the consumer an install.** They never install it by hand, and it costs deduplication, strands them on a vendored copy, and splits the dependency's types into two that fail `instanceof` ("Externalized is the default").
- **A `compilerOptions` block in `tsconfig.build.base.json`, or a `paths` block in `tsconfig.base.json`.** The first emits declarations against a different lib set than the source was written for; the second shadowed real package names with same-named local files (`references/tsconfig-presets.md`).

## Shared configs

Everything lives in `packages/configuration/src/`. Each export is a **factory** — call it, don't spread the export.

A package's `tsdown.config.ts` is one factory call plus only what is genuinely specific to it. If you are about to repeat a plugin, an exclude or a `deps` entry across two packages, it belongs in `configuration` instead. Which package calls which factory is countable from the repo — never restate it here.

The build script is bare `tsdown`. tsdown finds `tsdown.config.ts` by name; never pass `--config`.

### Barrels are generated by the build — `references/barrels.md`

`getTsdownConfiguration` runs ctix from a `build:prepare` hook, so no manifest repeats the command and generation is unguarded. **Touching a generated `src/index.ts`, the `exportsGeneration` option, or the `entry` that has to be stated for the hook to work** is that page.

### Compose with `mergeConfig`, never a spread

```ts
// Wrong — replaces `deps` wholesale, silently dropping the base's onlyImport gate.
const configuration: UserConfig = { ...getTsdownConfigurationNode(), deps: { alwaysBundle: ["x"] } };

// Right.
const configuration: UserConfig = mergeConfig(getTsdownConfigurationNode(), { deps: { alwaysBundle: ["x"] } });
```

A spread replaces a key outright. Every nested option the base set on `deps`, `dts` or `exports` disappears the moment a package adds one field of its own, and nothing fails — the build just stops doing something it used to. This applies to the factories in `configuration` as much as to a package config.

`mergeConfig` merges those objects, but a colliding _array_ inside one is still replaced rather than concatenated — `plugins` is the one exception — so a package extending a base list has to restate the whole list, not just its own additions.

## Externalized is the default — bundling is the exception

tsdown externalizes `dependencies` and `peerDependencies` and bundles `devDependencies` that the source imports. That is already the right answer, so **the thing you edit is the manifest, not the config**:

- `dependencies` → externalized. The consumer's package manager installs them transitively; nobody types their names, and they dedupe against the rest of the consumer's tree.
- `peerDependencies` → externalized, and additionally a demand on the consumer. Reserve them for things that must be a single instance — framework singletons (`vue`, `pinia`), the Drizzle and Pulumi runtimes. A dependency that merely appears in a signature does not need to be a peer.
- `optionalDependencies` → externalized, and the only kind that may be absent at runtime: the consumer installs one when their platform allows it. Reach for it behind a check, never as though it resolved. `peerDependenciesMeta` is read the same way, so a name appearing only there is external too — both are in the `onlyImport` allowlist for that reason.
- `devDependencies` → build, lint, test, codegen and typecheck tooling, plus anything a self-contained bundle deliberately vendors.
- Don't redeclare a transitive peer. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is db-schema's peer, not azure-mock's.

**Never bundle a dependency to save the consumer an install.** It saves nothing — they never install it by hand — and it costs deduplication, it strands them on a vendored copy when that dependency ships a fix, and it splits any type the dependency owns into two nominally distinct copies that fail `instanceof` against each other.

### Patterns, not bare names

Anything handed to `deps` goes through `getPackagePatterns`. A bare name never matches a subpath import, and `drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm` and `vitest/node` are all reached only that way. A list passed verbatim misses exactly those and the failure looks like an unrelated missing export.

### The opt-outs — `references/opt-outs.md`

A package departs from the default in exactly three ways, each declared in its own `tsdown.config.ts` and never in `configuration`. **Minifying a deploy artifact, vendoring what the default would externalize, or declaring the entry field a runtime host loads by convention** is that page.

### A package whose product is a side effect declares it

`sideEffects: false` is right for a library — it is what lets a consumer's bundler drop the parts of it they do
not import. It is fatal for a package whose **entry exists to run**, and the failure is silent in a way worth
recognising: a registration written as a bare call whose result nothing uses, in a module with no named export
for the barrel to keep alive, is a pure side effect by every rule a bundler has. Told the package has none, it
removes them all, keeps the exports, and drops the import of the host library entirely. What ships is a bundle
that loads without error and does nothing — for the Functions app, one that deploys, starts, reports `Running`
and never runs a trigger again.

So such a package sets `sideEffects: true`. Declaring it beats relying on the absence of the field, because the
absence is what a repo-wide sweep adding `false` everywhere overwrites without anyone reading the diff twice.
A package whose side effects each land in an exported binding — the infrastructure program's
`export const x = new Resource(...)` — needs nothing: the export is what keeps it alive.

**Every package answers, and one of three answers.** `false` where nothing runs at import; `true` where the
entry exists to run; an **array of module paths** where one module runs and the rest are ordinary exports — a
package registering a plugin at module scope names that file rather than surrendering the whole package's
tree-shaking to a blanket `true`. Name both arms when a package is resolved through both: a consumer
on `source` reaches the file itself, one on `default` gets a single chunk that carries the registration with
everything else, and a path matching neither leaves a bundler free to drop the call.

Leaving the field off is not the safe middle — absent means _unknown_, so a consumer's bundler keeps everything,
the same outcome as `true` while reading as nobody having considered it. Nothing can derive the value, so
`scripts/sideEffects.test.ts` enforces what is derivable: every package with a tsdown config declares the field,
and only the run-on-import one claims `true` wholesale.

**Assert it in that package's own `src/index.test.ts`.** Count the registrations in the built bundle against the
source files that should have produced them; nothing else can see the difference, because every other test
imports source rather than `dist`, and the bundle still loads either way.

### Declarations a bundle cannot carry — `references/declarations.md`

Two kinds of declaration are invisible to the build that should emit them, and both fail silently with every check green. **A package holding an ambient `.d.ts` no entrypoint imports, or wrapping a library whose types a plugin augments** is that page.

## Every bundle's externals are gated

`deps.onlyImport` applies to **every** package: a bundle may leave external only what its own manifest names. It catches two different failures with one check.

- **A published package importing a _private_ sibling** passes every local check — the workspace has the sibling on disk — and resolves nothing on a fresh `npm install`. If it fires, the fix is to make the import legitimate (publish what it needs, or move the shared code somewhere published), never to widen the list.
- **A specifier that resolved to nothing.** Rolldown externalizes an unresolvable `#src/...` rather than failing, so the `dist` ships an import Node then resolves through the package's own `imports` map to a `.ts` file it cannot load. That surfaces in a _consumer_, at runtime, naming a source path the consumer never referenced — `Cannot find module .../packages/db-schema/src/services/missing.ts imported from .../db-schema/dist/index.js`. The gate turns it into a build error in the package that caused it.

`@esposter/configuration` is the one package that widens the list, because everything it externalizes is a `devDependency` and the base derives the allowlist from the runtime fields only.

`deps.onlyImport` checks that imports are declared. It cannot check that a declared dependency is actually _publishable_, and neither can publint — a private sibling sitting in `dependencies` is declared, well-formed, and still ships a package that resolves nothing on a stranger's `npm install`. That edge is the one thing about the manifest no build gate can see, so `scripts/publishedDependencies.test.ts` asserts it instead: no published package names a private sibling in any field a consumer's package manager resolves.

## A published package is gated further

Absence of `private` in the manifest switches on `publint` and `attw`. Never disable one to get a build through — each marks a package that would fail on someone else's machine:

- `publint` — the manifest points at a file the package does not ship.
- `attw` — the declarations break under a resolution mode a consumer might use.

## Self-alias and source exports — `references/source-exports.md`

A package refers to its own source through Node subpath imports (`"imports": { "#src/*": "./src/*.ts" }`), never `@/` — `packages/app` is the one tree that keeps `@/`, because Nuxt generates those aliases and nothing bundles the app from source. That is what lets `getTsdownConfiguration` give every package a second `source` export arm pointing at its TypeScript. **Writing a specifier that has to survive a sibling bundling this package, or deciding what the `source` condition reaches**, is that page — its two rejected variants are in `Settled` above.

## Dist size is the correctness signal

Every package snapshots its `dist/index.js` size in `src/index.test.ts`, and its `index.d.ts` too unless it skips `dts`. After changing a manifest, a `deps` entry or a config factory, rebuild and run those — a jump means something started being bundled that shouldn't be, and a `-u` that "fixes" a large jump is hiding the bug.

`sideEffects: false` is a claim, not a formality. Declare it only where the package genuinely has no top-level side effects — a package registering a library plugin at module scope has one, and names that module instead.

## tsconfig presets and the bootstrap package — `references/tsconfig-presets.md`

Presets live in `@esposter/configuration` and are extended by path; the base carries no framework assumption. **Editing a preset, or changing `@esposter/configuration` itself** — which is built by the factories it exports, and is exempt from rules that would make its build a cycle — is that page.

## Dependency installs & workspace graph

Covered by root `CLAUDE.md` (`pnpm i`, `pnpm graph:gen`) and `packages/app/content/docs/architecture/monorepo-tooling.md` (install safety rules). One addition: if `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.
