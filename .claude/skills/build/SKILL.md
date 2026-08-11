---
name: build
description: Esposter rolldown build conventions — shared rolldown configs, external list rules, self-contained bundle packages, and why a declare-module augmentation never travels through a bundled .d.ts to a consuming package. Apply when adding packages, editing rolldown configs, or wrapping a library whose types are augmented by a plugin.
---

# Build Conventions (Rolldown)

## Shared Rolldown Configs

Located in `packages/configuration/src/`. All library packages import one of:

Each is a **factory** — call it, don't spread the export: `getRolldownConfigurationBrowser(): RolldownOptions`.

| Config                               | Platform                 | Use for                                                                                             |
| ------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `getRolldownConfigurationBrowser`    | browser                  | `db-schema`, `parse-tmx`, `shared`                                                                  |
| `getRolldownConfigurationNode`       | node                     | `azure-functions`, `azure-mock`, `configuration`, `db`, `db-mock`, `infra`, `shared-node`, `virrun` |
| `getRolldownConfigurationIsomorphic` | browser + node polyfills | `xml2js`                                                                                            |

All extend `getRolldownConfigurationBrowser()`. Node adds `platform: "node"`; Isomorphic adds `@rolldown/plugin-node-polyfills`. Use `{ external }` shorthand when no extra entries needed; spread `[...external, "extra"]` only when the package needs additional externals.

Base browser config passes only `tsconfig` to `dts()` — the DTS generator is left inferred. `rolldown-plugin-dts` picks `oxc` for packages with `isolatedDeclarations` and `tsc` otherwise (`tsgo` is auto-selected only on TypeScript 7, which this repo does not use). Don't pass a `generator`/`tsgo` option unless a package genuinely needs a specific one.

## Global External List

Defined in `packages/configuration/src/external/external.ts`, exported as `external` — the **single source of truth** for what is externalized. Used by `getRolldownConfigurationBrowser` (extended by all rolldown configs) and by `getViteConfiguration`.

```ts
// packages/configuration/src/external/external.ts
export const external: (RegExp | string)[] = [
  // Workspace packages — never bundle sibling packages
  /@esposter\//u,
  "azure-mock",
  "parse-tmx",
  "vue-phaserjs",
  // @esposter/azure-mock
  "@azure/core-http-compat",
  // ... (grouped by owning @esposter package, alphabetical package order, alphabetical entries within)
];
```

### Key rules

- `/@esposter\//u` covers all `@esposter/*` workspace packages — never add individual `@esposter/foo` strings.
- Non-`@esposter/` workspace packages must be listed explicitly (`azure-mock`, `parse-tmx`, `vue-phaserjs` — not covered by the regex).
- The external list is a build superset, not a per-package peer-dependency checklist — a package declares only the externalized packages it directly imports at runtime or exposes through its `.d.ts` surface.
- Do not duplicate transitive peers — the package that directly imports a dependency owns the contract. If `azure-mock` imports `@esposter/db-schema` which imports `zod`, `zod` is `db-schema`'s peer, not `azure-mock`'s.
- `dependencies` get bundled; `peerDependencies` are externalized. When a package directly imports a non-workspace package that should not be bundled, put it in `peerDependencies` and ensure the shared external list covers it. Exceptions: `@esposter/app` (root consumer, not a library) and the self-contained bundles `@esposter/azure-functions` / `virrun` (override the external list to bundle almost everything — see Self-Contained Bundle Packages).
- Vite builds: `getViteConfiguration` lives in `packages/configuration/src/getViteConfiguration.ts`; consumers like `vue-phaserjs` import it from `@esposter/configuration`.

### Ordering convention

Group by owning `@esposter` package; sections in alphabetical package-name order; entries alphabetical within each section. Section header comment is the bare package name (`// @esposter/db`). One exception: a final "Vue framework" group for always-consumer-provided deps not owned by a single package (`@vueuse/core`, `pinia`, `vue`).

### Dependency declaration convention

> **CRITICAL — external imports are `peerDependencies`, never `dependencies`/`devDependencies`.** If a library package directly imports a non-workspace package that is in the shared `external` list (so it's externalized, not bundled, and ships in that package's dist/declaration surface), it **must** be declared in `peerDependencies` — never in `dependencies` and never in `devDependencies`. We keep regressing on this: a fix that adds an externalized import as a `dependency` (so it resolves locally) silently ships the wrong contract. Audit against `external.ts` after touching the external list or any manifest. The rule scopes to a package's **published runtime/declaration surface** — an externalized package a manifest pulls in only as build/test tooling (never imported by its shipped code) is correctly a `devDependency`, not a peer. Example: `@codspeed/vitest-plugin` is an optional `peerDependency` of `@esposter/configuration` (which lazy-imports it in `getBenchmarkPlugins`), but a `devDependency` of only the packages that actually bench (`app`, `virrun`) — the lazy `CODSPEED_ENV`-gated import means non-bench packages never load it, so they declare no codspeed dep (see [Bench › the report pipeline](../bench/references/report-pipeline.md)). The self-contained bundles (`@esposter/app`, `@esposter/azure-functions`, `virrun` — see Self-Contained Bundle Packages) also opt out of external→peer for their bundled deps.

- `dependencies`: direct runtime imports to bundle or auto-install for consumers. Workspace packages imported at runtime usually go here even though the external list keeps their code out of the bundle.
- `peerDependencies`: direct runtime or declaration-surface imports that are externalized and must be supplied by the consumer — framework/runtime singletons (`vue`, `pinia`), SDKs mirrored in public APIs, Drizzle/Pulumi runtimes, package-plugin ecosystems.
- `devDependencies`: build, lint, test, codegen, typecheck tools; test-only packages; packages used only by source types that don't appear in generated declarations.
- If a package only needs a dependency because an imported workspace package needs it, don't redeclare it as a peer — let the directly importing workspace package own it.

### Auditing external vs peerDependencies alignment

Read the `external` array in `packages/configuration/src/external/external.ts` (the source of truth — never transcribe it into a script, the copy goes stale) and check each package's `dependencies` against it: any entry the list externalizes belongs in `peerDependencies`. `@esposter/app`, `@esposter/azure-functions`, and `virrun` are the intentional exceptions.

## Self-Contained Bundle Packages (azure-functions, virrun)

Both vendor almost everything so consumers need **no peer deps**, but they draw the line differently:

```ts
external: [...externalVueFramework, "@azure/functions"],   // azure-functions — provided by the runtime
external: ["unconfig"],                                    // virrun — vendors even the vue framework peers
```

- **azure-functions** keeps `externalVueFramework` (`vue`, `@vueuse/core`, `pinia`) external — it doesn't use Vue, and `@azure/functions` is supplied by the runtime.
- **virrun** externalizes only `unconfig`: its synchronous TS loading does `createRequire(import.meta.url)("jiti")` relative to its own installed file, so vendoring it would rebase that resolution into the bundle and break config loading in consumer repos. Everything else — including the vue peers and `@platformatic/vfs` (a devDep) — is vendored.
- **Never spread the full `external` list here** — `/@esposter\//u` would externalize `@esposter/shared`/`@esposter/db`, re-introducing peer deps.
- An `INVALID_ANNOTATION` warning is never our code — it comes from a bundled third-party `dist` (`@vueuse/core`). **Do not "fix" it by externalizing that dep**: virrun's config comment records that trade-off as rejected — zero peer deps for consumers is worth the harmless warning. Never edit the third-party comments either.

## Module Augmentations Do Not Cross a Package Boundary

A `declare module "x"` augmentation — a dayjs plugin, a Zod extension, a Vuetify labs type — is resolved **per TypeScript program** against that module's identity. It is not a value, so it cannot be re-exported, and it does not travel inside a bundled `.d.ts`. Neither `import type {} from "dayjs/plugin/duration"` nor a `/// <reference types="…" />` in the source survives the bundle, and externalizing the dependency changes nothing: the consumer's own program still has to contain the plugin's declarations before the augmented member resolves.

So a package that wraps an augmented library exports the **value** and lets each consumer register the augmentation itself — `packages/db-schema`'s `dayjs` re-export calls `baseDayjs.extend(duration)` so the runtime works everywhere, and every package that types a `.duration(...)` call still imports the plugin in its own graph. Don't chase this with a barrel re-export or a reference directive; both look like they work until a downstream `pnpm typecheck` reports the member missing.

## Dependency Installs & Workspace Graph

Covered by root `CLAUDE.md` (`pnpm i`, `pnpm depcruise:graph`) and `packages/app/content/docs/architecture/monorepo-tooling.md` (install safety rules). One addition: if `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.
