---
name: build
description: Esposter rolldown build conventions — the shared configuration factories, the external list derived from each package's own manifest and the two kinds of package that opt out, why dist is wiped every build, the tsconfig preset chain and the build preset that carries excludes only, and why a declare-module augmentation never travels through a bundled .d.ts to a consuming package. Apply when adding packages, editing rolldown or tsconfig configs, changing a manifest's dependency placement, or wrapping a library whose types are augmented by a plugin.
---

# Build Conventions (Rolldown)

The mechanism — what runs, in what order, and why — is [/docs/architecture/build-pipeline](../../../packages/app/content/docs/architecture/build-pipeline.md). This skill is the conventions you apply when editing it.

## Shared configs

Everything lives in `packages/configuration/src/`. Each export is a **factory** — call it, don't spread the export.

A package's `rolldown.config.ts` is one call plus only what is genuinely specific to it. If you are about to repeat a plugin, an exclude or an external across two packages, it belongs in `configuration` instead. Which package calls which factory is countable from the repo — never restate it here.

Base browser config passes only `tsconfig` to `dts()`; the DTS generator is left inferred, and `rolldown-plugin-dts` picks `oxc` where `isolatedDeclarations` is on and `tsc` otherwise. Don't pass a `generator`/`tsgo` option unless a package genuinely needs a specific one.

`getViteConfiguration` is for `.vue` packages only. It is still a Rolldown build (Vite 8 bundles with Rolldown — hence `build.rolldownOptions`); Vite is there for SFC compilation and the `vue-tsc` declaration build. Don't "migrate it to rolldown" — that trade was already made and the bundler is the same one.

## External is derived — never hand-listed

`getExternal()` reads the **calling package's own `package.json`** (rolldown runs with that package as cwd) and returns its `peerDependencies` plus every workspace sibling, each as a prefix pattern so subpath imports are covered too.

So the only thing you edit to change what a package externalizes is **that package's manifest**:

- `dependencies` → bundled. The package's own implementation detail.
- `peerDependencies` → externalized. Anything in the published runtime or declaration surface the consumer must supply exactly one copy of — framework singletons (`vue`, `pinia`), SDKs mirrored in a public API, the Drizzle/Pulumi runtimes.
- `devDependencies` → build, lint, test, codegen and typecheck tooling, plus anything used only by types that never reach the generated declarations.
- Don't redeclare a transitive peer. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is db-schema's peer, not azure-mock's.

There is no list to audit against any more, and no ordering convention to maintain. **Do not reintroduce one** — a shared registry is exactly what let a forgotten entry silently vendor a dependency into a bundle.

### The opt-outs

Both are declared in the package's own `rolldown.config.ts`, not in `configuration`:

- **Self-contained bundles** (`virrun`, `azure-functions`) vendor almost everything so consumers manage no peers. `virrun` externalizes only `unconfig` — its synchronous TS loading does `createRequire(import.meta.url)("jiti")` relative to its own installed file, so vendoring rebases that resolution and breaks config loading in consumer repos. `azure-functions` externalizes only `@azure/functions`, supplied by the Functions host, and skips `dts` entirely because nothing consumes its types. Never spread a derived external list into either — `@esposter/*` would come back as peer deps.
- **`@esposter/configuration`** calls `getExternal("devDependencies")`. It is private, never published, and its dist imports nothing but build tooling every workspace member already has installed, so peers would invent a contract nobody consumes. This is the one package where an externalized import is correctly a devDependency.

An `INVALID_ANNOTATION` warning is never our code — it comes from a bundled third-party `dist` (`@vueuse/core`). **Do not "fix" it by externalizing that dep**: virrun's config records that trade-off as rejected. Never edit the third-party comments either.

## dist is wiped every build

`getCleanDistributionPlugin` is in the base config's `plugins`. Rolldown never clears `output.dir` and chunk filenames are content-hashed, so without it every build leaves its predecessor's chunks behind forever. Keep it first in any `plugins` array a package overrides. The Vite path doesn't need it — Vite empties `outDir` itself.

**Dist size is the correctness signal for anything touching externals.** Every package snapshots its `dist/index.js` and `index.d.ts` size in `src/index.test.ts`. After changing a manifest, an external, or a config factory, rebuild and run those — a jump means something started being bundled that shouldn't be, and a `-u` that "fixes" a large jump is hiding the bug.

## tsconfig presets

`tsconfig.base.json` → `tsconfig.library.json` (composite + isolatedDeclarations) → `tsconfig.node.json` (`types: ["node"]`), with `tsconfig.vue.json` a sibling leaf off the base. The base carries **no framework assumption** — anything Vue-specific (`jsx`, DOM libs, the dxup language-service plugins, the `.vue` include) belongs in the Vue leaf, never at the root where every Node package inherits it.

`tsconfig.build.json` holds **excludes and nothing else** — no `compilerOptions`, deliberately. A package's build config extends `["./tsconfig.json", "../configuration/tsconfig.build.json"]`, so its build program inherits the same platform, libs and `types` as the program it is typechecked with. Adding a `compilerOptions` block back there re-creates the bug it was written to remove: declarations emitted against a different lib set than the source was written for, invisible until something downstream fails to resolve.

These are `**/*.json` under a strict `json/json` ESLint language — **no comments**. Rationale goes in the docs page, not the file.

## Module augmentations do not cross a package boundary

A `declare module "x"` augmentation — a dayjs plugin, a Zod extension, a Vuetify labs type — is resolved **per TypeScript program** against that module's identity. It is not a value, so it cannot be re-exported, and it does not travel inside a bundled `.d.ts`. Neither `import type {} from "dayjs/plugin/duration"` nor a `/// <reference types="…" />` in the source survives the bundle, and externalizing the dependency changes nothing: the consumer's own program still has to contain the plugin's declarations before the augmented member resolves.

So a package that wraps an augmented library exports the **value** and lets each consumer register the augmentation itself — `packages/db-schema`'s `dayjs` re-export calls `baseDayjs.extend(duration)` so the runtime works everywhere, and every package that types a `.duration(...)` call still imports the plugin in its own graph. Don't chase this with a barrel re-export or a reference directive; both look like they work until a downstream `pnpm typecheck` reports the member missing.

## Dependency installs & workspace graph

Covered by root `CLAUDE.md` (`pnpm i`, `pnpm depcruise:graph`) and [monorepo tooling](../../../packages/app/content/docs/architecture/monorepo-tooling.md) (install safety rules). One addition: if `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.
