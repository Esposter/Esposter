---
name: build
description: Esposter rolldown build conventions — shared rolldown configs, external list rules, and self-contained bundle packages. Apply when adding packages or editing rolldown configs.
---

# Build Conventions (Rolldown)

## Shared Rolldown Configs

Located in `packages/configuration/src/`. All library packages import one of:

| Config                            | Platform                 | Use for                                |
| --------------------------------- | ------------------------ | -------------------------------------- |
| `rolldownConfigurationBrowser`    | browser                  | `db-schema`, `parse-tmx`, `shared`     |
| `rolldownConfigurationNode`       | node                     | `db`, `azure-mock`, `infra`, `db-mock` |
| `rolldownConfigurationIsomorphic` | browser + node polyfills | `xml2js`                               |

All extend `rolldownConfigurationBrowser`. Node adds `platform: "node"`; Isomorphic adds `@rolldown/plugin-node-polyfills`. Use `{ external }` shorthand when no extra entries needed; spread `[...external, "extra"]` only when the package needs additional externals.

Base browser config enables `tsgo: true` in `dts()` (`@typescript/native-preview` for fast DTS gen; in catalog — do not remove).

## Global External List

Defined in `packages/configuration/src/external/external.ts`, exported as `external`. Used by `rolldownConfigurationBrowser` (extended by all rolldown configs) and by `viteConfiguration`.

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
- Vite builds: `viteConfiguration` lives in `packages/configuration/src/viteConfiguration.ts`. `packages/configuration/vite.config.js` imports it from source; consumers like `vue-phaserjs` import it from `@esposter/configuration`.

### Ordering convention

Group by owning `@esposter` package; sections in alphabetical package-name order; entries alphabetical within each section. Section header comment is the bare package name (`// @esposter/db`). One exception: a final "Vue framework" group for always-consumer-provided deps not owned by a single package (`@vueuse/core`, `pinia`, `vue`).

### Dependency declaration convention

> **CRITICAL — external imports are `peerDependencies`, never `dependencies`/`devDependencies`.** If a library package directly imports a non-workspace package that is in the shared `external` list (so it's externalized, not bundled, and ships in that package's dist/declaration surface), it **must** be declared in `peerDependencies` — never in `dependencies` and never in `devDependencies`. We keep regressing on this: a fix that adds an externalized import as a `dependency` (so it resolves locally) silently ships the wrong contract. Audit with the script below after touching the external list or any manifest. The rule scopes to a package's **published runtime/declaration surface** — an externalized package a manifest pulls in only as build/test tooling (never imported by its shipped code) is correctly a `devDependency`, not a peer. Example: `@codspeed/vitest-plugin` is an optional `peerDependency` of `@esposter/configuration` (which lazy-imports it in `getBenchmarkPlugins`), but a `devDependency` of only the packages that actually bench (`app`, `virrun`) — the lazy `CODSPEED_ENV`-gated import means non-bench packages never load it, so they declare no codspeed dep (see [Bench › Dependency placement](../bench/SKILL.md)). The self-contained bundles (`@esposter/app`, `@esposter/azure-functions`, `virrun` — see Self-Contained Bundle Packages) also opt out of external→peer for their bundled deps.

- `dependencies`: direct runtime imports to bundle or auto-install for consumers. Workspace packages imported at runtime usually go here even though the external list keeps their code out of the bundle.
- `peerDependencies`: direct runtime or declaration-surface imports that are externalized and must be supplied by the consumer — framework/runtime singletons (`vue`, `pinia`), SDKs mirrored in public APIs, Drizzle/Pulumi runtimes, package-plugin ecosystems.
- `devDependencies`: build, lint, test, codegen, typecheck tools; test-only packages; packages used only by source types that don't appear in generated declarations.
- If a package only needs a dependency because an imported workspace package needs it, don't redeclare it as a peer — let the directly importing workspace package own it.

### Auditing external vs peerDependencies alignment

Run from repo root to find any `dependencies` entry that should be a `peerDependency`:

```js
// node -e "..." or save as a script
const fs = require("fs"),
  path = require("path");
const externalStrings = [
  "@azure/data-tables",
  "@azure/core-http-compat",
  "@azure/core-rest-pipeline",
  "@azure/eventgrid",
  "@azure/search-documents",
  "@azure/storage-blob",
  "@azure/storage-queue",
  "@azure/web-pubsub",
  "@rolldown/plugin-node-polyfills",
  "@electric-sql/pglite",
  "@pulumi/azure-native",
  "@pulumi/pulumi",
  "@vitejs/plugin-vue",
  "@vueuse/core",
  "pinia",
  "rolldown",
  "rolldown-plugin-dts",
  "vue",
  "phaser",
  "vite",
  "vite-plugin-mkcert",
  "zod",
];
const externalPatterns = [
  /^@codspeed\//,
  /^drizzle-kit/,
  /^drizzle-orm/,
  /^phaser4-rex-plugins/,
  /^unplugin-auto-import/,
  /^unplugin-dts/,
  /^vitest(\/|$)/,
];
const skip = new Set(["@esposter/app", "@esposter/azure-functions", "virrun"]); // intentional exceptions
const pkgsDir = "packages";
for (const dir of fs.readdirSync(pkgsDir)) {
  const p = path.join(pkgsDir, dir, "package.json");
  if (!fs.existsSync(p)) continue;
  const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
  if (skip.has(pkg.name)) continue;
  const peers = new Set(Object.keys(pkg.peerDependencies || {}));
  for (const dep of Object.keys(pkg.dependencies || {})) {
    const isExt = externalStrings.includes(dep) || externalPatterns.some((r) => r.test(dep));
    if (isExt && !peers.has(dep)) console.log(`${pkg.name}: ${dep} should be peerDependency`);
  }
}
```

## Self-Contained Bundle Packages (azure-functions, virrun)

Both vendor everything except the vue framework peer deps plus one runtime-provided module, so consumers need **no peer deps**:

```ts
external: [...externalVueFramework, "@azure/functions"],   // azure-functions — provided by the runtime
external: [...externalVueFramework, "@platformatic/vfs"],  // virrun — declared dependency
```

- `externalVueFramework` (`vue`, `@vueuse/core`, `pinia`) — neither package uses Vue, so these tree-shake out; keeping them external also stops rolldown parsing `@vueuse/core/dist/index.js` and emitting its harmless `INVALID_ANNOTATION` ("comment ignored due to position") warnings.
- **Never spread the full `external` list here** — `/@esposter\//u` would externalize `@esposter/shared`/`@esposter/db`, re-introducing peer deps.
- An `INVALID_ANNOTATION` warning is never our code — it comes from a bundled third-party `dist`. Fix by externalizing that dep, never by editing comments.

## Dependency Installs

- Use plain `pnpm i` from the repo root when package manifests change.
- Follow `architecture/monorepo-tooling.md` for install safety rules.
- If `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.

## Workspace Graph

- Use `pnpm depcruise:graph` to generate `dependency-graph.svg`.
- It should pipe dependency-cruiser DOT output directly into `graphviz-cli`; avoid keeping intermediate `MODULES.dot`, `MODULES.mmd`, or generated Markdown wrapper files unless explicitly requested.
