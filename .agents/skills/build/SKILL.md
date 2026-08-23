---
name: build
description: Esposter tsdown build conventions — the shared configuration factories and composing them with mergeConfig rather than a spread, dependencies being externalized while devDependencies are bundled and the two kinds of package that opt out, subpath-aware package patterns, the publint/attw/onlyImport gates a published package gets and why a private one gets none, why exports.devExports is unavailable here, the tsconfig preset chain and the isolatedDeclarations exception, the bootstrap package, and why a declare-module augmentation never travels through a bundled .d.ts to a consuming package. Apply when adding packages, editing tsdown or tsconfig configs, changing a manifest's dependency placement, or wrapping a library whose types are augmented by a plugin.
---

# Build Conventions (tsdown)

The mechanism — what runs, in what order, and why — is `packages/app/content/docs/architecture/build-pipeline.md`. This skill is the conventions you apply when editing it.

## Shared configs

Everything lives in `packages/configuration/src/`. Each export is a **factory** — call it, don't spread the export.

A package's `tsdown.config.ts` is one factory call plus only what is genuinely specific to it. If you are about to repeat a plugin, an exclude or a `deps` entry across two packages, it belongs in `configuration` instead. Which package calls which factory is countable from the repo — never restate it here.

The build script is bare `tsdown`. It finds `tsdown.config.ts` by name; never pass `--config`.

### Compose with `mergeConfig`, never a spread

```ts
// Wrong — replaces `deps` wholesale, silently dropping the base's onlyImport gate.
const configuration: UserConfig = { ...getTsdownConfigurationNode(), deps: { alwaysBundle: ["x"] } };

// Right.
const configuration: UserConfig = mergeConfig(getTsdownConfigurationNode(), { deps: { alwaysBundle: ["x"] } });
```

A spread replaces a key outright. Every nested option the base set on `deps`, `dts` or `exports` disappears the moment a package adds one field of its own, and nothing fails — the build just stops doing something it used to. This applies to the factories in `configuration` as much as to a package config.

## Externalized is the default — bundling is the exception

tsdown externalizes `dependencies` and `peerDependencies` and bundles `devDependencies` that the source imports. That is already the right answer, so **the thing you edit is the manifest, not the config**:

- `dependencies` → externalized. The consumer's package manager installs them transitively; nobody types their names, and they dedupe against the rest of the consumer's tree.
- `peerDependencies` → externalized, and additionally a demand on the consumer. Reserve them for things that must be a single instance — framework singletons (`vue`, `pinia`), the Drizzle and Pulumi runtimes. A dependency that merely appears in a signature does not need to be a peer.
- `devDependencies` → build, lint, test, codegen and typecheck tooling, plus anything a self-contained bundle deliberately vendors.
- Don't redeclare a transitive peer. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is db-schema's peer, not azure-mock's.

**Never bundle a dependency to save the consumer an install.** It saves nothing — they never install it by hand — and it costs deduplication, it strands them on a vendored copy when that dependency ships a fix, and it splits any type the dependency owns into two nominally distinct copies that fail `instanceof` against each other.

### Patterns, not bare names

Anything handed to `deps` goes through `getPackagePatterns`. A bare name never matches a subpath import, and `drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm` and `vitest/node` are all reached only that way. A list passed verbatim misses exactly those and the failure looks like an unrelated missing export.

### The opt-outs

Declared in the package's own `tsdown.config.ts`, never in `configuration`:

- **Self-contained bundles** (`virrun`, `azure-functions`) vendor what they use so consumers manage no peers. `virrun` needs no `alwaysBundle` at all — everything it vendors is already a `devDependency` — and declares only that `unconfig` stays external, because `unconfig` resolves `jiti` through `createRequire` relative to its own installed file and vendoring rebases that lookup. `azure-functions` derives `alwaysBundle` from its own manifest minus what the Functions host provides, and sets `dts: false` because nothing consumes its types.
- **`@esposter/configuration`** uses `deps: { neverBundle: true }`. It is private, never published, and its dist imports nothing but build tooling every workspace member already has installed.

## A published package is gated

Absence of `private` in the manifest switches on `publint`, `attw` and `deps.onlyImport`. Never disable one to get a build through — each marks a package that would fail on someone else's machine:

- `publint` — the manifest points at a file the package does not ship.
- `attw` — the declarations break under a resolution mode a consumer might use.
- `deps.onlyImport` — an emitted chunk imports a package the manifest never told the consumer to install.

That last one exists because a published package importing a _private_ sibling passes every local check — the workspace has the sibling on disk — and resolves nothing on a fresh `npm install`. If it fires, the fix is to make the import legitimate (publish what it needs, or move the shared code somewhere published), never to widen the list.

`deps.onlyImport` checks that imports are declared. It cannot check that a declared dependency is actually _publishable_, and neither can publint — a private sibling sitting in `dependencies` still ships a broken package. Adding a workspace sibling to a published package's `dependencies` is the case to think about by hand.

## `exports.devExports` is unavailable here

It would point a package's exports at `src` for workspace consumers and at `dist` only on publish, so no rebuild stood between an edit and a consumer seeing it. **Don't reach for it.** Every package resolves its own source through the `@/*` alias, which resolves relative to whichever package the build is running in — so as soon as a sibling bundles the package from source, its internal `@/...` imports resolve into the bundling package and vanish. `azure-functions` and `azure-mock` both vendor siblings. This stays true until the `@/*` self-alias convention changes.

## Dist size is the correctness signal

Every package snapshots its `dist/index.js` size in `src/index.test.ts`, and its `index.d.ts` too unless it skips `dts`. After changing a manifest, a `deps` entry or a config factory, rebuild and run those — a jump means something started being bundled that shouldn't be, and a `-u` that "fixes" a large jump is hiding the bug.

`sideEffects: false` is a claim, not a formality. Declare it only where the package genuinely has no top-level side effects; `db` and `db-schema` carry a `baseDayjs.extend(duration)` at module scope and so declare nothing.

## tsconfig presets

`tsconfig.base.json` → `tsconfig.library.json` (composite + isolatedDeclarations) → `tsconfig.node.json` (`types: ["node"]`), with `tsconfig.vue.json` a sibling leaf off the base. The base carries **no framework assumption** — anything Vue-specific belongs in the Vue leaf, never at the root where every Node package inherits it.

`tsconfig.build.base.json` holds **excludes and nothing else** — no `compilerOptions`, deliberately. A package's `tsconfig.build.json` extends `["./tsconfig.json", "../configuration/tsconfig.build.base.json"]`, so its build program inherits the same platform, libs and `types` as the program it is typechecked with. Adding a `compilerOptions` block back there re-creates the bug it was written to remove: declarations emitted against a different lib set than the source was written for, invisible until something downstream fails to resolve.

`isolatedDeclarations` is off in the packages that cannot satisfy it — a Drizzle table type cannot be written out by hand — and in any package that **vendors one of those from source**, because the transform runs over the whole module graph rather than per package. That is a tsconfig property; no declaration-generator option waives it for one build.

These are `**/*.json` under a strict `json/json` ESLint language — **no comments**. Rationale goes in the docs page, not the file.

## The bootstrap package

`@esposter/configuration` is built by the factories it exports. Its relative imports carry a `.ts` extension because tsdown loads a config with a native import that will not guess one, and it keeps its exports pointing at `dist` for the same reason. Both are specific to it — don't copy either into another package.

## Module augmentations do not cross a package boundary

A `declare module "x"` augmentation — a dayjs plugin, a Zod extension, a Vuetify labs type — is resolved **per TypeScript program** against that module's identity. It is not a value, so it cannot be re-exported, and it does not travel inside a bundled `.d.ts`. Neither `import type {} from "dayjs/plugin/duration"` nor a `/// <reference types="…" />` in the source survives the bundle, and externalizing the dependency changes nothing: the consumer's own program still has to contain the plugin's declarations before the augmented member resolves.

So a package that wraps an augmented library exports the **value** and lets each consumer register the augmentation itself — `packages/db-schema`'s `dayjs` re-export calls `baseDayjs.extend(duration)` so the runtime works everywhere, and every package that types a `.duration(...)` call still imports the plugin in its own graph. Don't chase this with a barrel re-export or a reference directive; both look like they work until a downstream `pnpm typecheck` reports the member missing.

## Dependency installs & workspace graph

Covered by root `CLAUDE.md` (`pnpm i`, `pnpm depcruise:graph`) and `packages/app/content/docs/architecture/monorepo-tooling.md` (install safety rules). One addition: if `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.
