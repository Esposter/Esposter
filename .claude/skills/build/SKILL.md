---
name: build
description: Esposter rolldown build conventions — shared rolldown configs, external list rules, bundle sizes, azure-functions special case. Apply when adding packages, editing rolldown configs, or optimizing bundle sizes.
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
- `dependencies` get bundled; `peerDependencies` are externalized. When a package directly imports a non-workspace package that should not be bundled, put it in `peerDependencies` and ensure the shared external list covers it. Exceptions: `@esposter/app` (root consumer, not a library) and `@esposter/azure-functions` (overrides external list to bundle almost everything).
- Vite builds: `viteConfiguration` lives in `packages/configuration/src/viteConfiguration.ts`. `packages/configuration/vite.config.js` imports it from source; consumers like `vue-phaserjs` import it from `@esposter/configuration`.

### Ordering convention

Group by owning `@esposter` package; sections in alphabetical package-name order; entries alphabetical within each section. Section header comment is the bare package name (`// @esposter/db`). One exception: a final "Vue framework" group for always-consumer-provided deps not owned by a single package (`@vueuse/core`, `pinia`, `vue`).

### Dependency declaration convention

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
  /^drizzle-kit/,
  /^drizzle-orm/,
  /^phaser4-rex-plugins/,
  /^unplugin-auto-import/,
  /^unplugin-dts/,
];
const skip = new Set(["@esposter/app", "@esposter/azure-functions"]); // intentional exceptions
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

## Azure Functions Special Case

`packages/azure-functions/rolldown.config.ts` uses a targeted external list instead of the full global one:

```ts
external: [...externalVueFramework, "@azure/functions"],
```

- `externalVueFramework` (`vue`, `@vueuse/core`, `pinia`) — peer deps of `@esposter/shared`/`@esposter/vue-phaserjs`; azure-functions doesn't use Vue so rolldown tree-shakes these out safely.
- Everything else is bundled — the runtime provides only `@azure/functions`; all other deps (Azure SDKs, drizzle-orm, zod, postgres, `@esposter/*`) must be in the bundle.
- Do not spread the full `external` list here — its `/@esposter\//u` would externalize `@esposter/db`, `@esposter/shared`, etc., breaking runtime.

## Bundle Sizes (Baselines)

| Package                     | Size    | Notes                        |
| --------------------------- | ------- | ---------------------------- |
| `@esposter/azure-functions` | ~4.23MB | Intentionally self-contained |
| `@esposter/azure-mock`      | ~35.8KB | Azure SDKs external          |
| `@esposter/configuration`   | ~4KB    | Build toolchain external     |
| `@esposter/db`              | ~1.09MB | Azure SDKs external          |
| `@esposter/db-mock`         | ~886B   | Re-exports                   |
| `@esposter/db-schema`       | ~64.4KB | Schema only                  |
| `@esposter/infra`           | ~121KB  | Pulumi resources external    |
| `@esposter/parse-tmx`       | ~815KB  | xml2js external              |
| `@esposter/shared`          | ~384KB  | Vue/Zod external             |
| `@esposter/xml2js`          | ~1.12MB | Bundles sax + xmlbuilder2    |
| `vue-phaserjs`              | ~34KB   | Phaser/parse-tmx external    |

## Adding a New Package

1. Create `rolldown.config.ts` importing the appropriate base config.
2. Add to `package.json`: `"build": "pnpm export:gen && rolldown --config rolldown.config.ts"`.
3. For any direct dep the consumer should provide, add it to `peerDependencies` AND verify it's covered by the global external list (or add it). Don't add transitive-only peers from imported workspace packages.
4. Add `src/index.test.ts` bundle size snapshot (see testing skill).
5. Add `test`/`coverage` scripts + `vitest`, `@vitest/coverage-v8`, `@types/node` to `devDependencies`.
6. Run `pnpm i` from the workspace root after editing `package.json`.

## Dependency Installs

- Use plain `pnpm i` from the repo root when package manifests change.
- Follow `architecture/monorepo-tooling.md` for install safety rules.
- If `pnpm i` needs network access, request approval for plain `pnpm i` rather than changing pnpm store settings.

## Workspace Graph

- Use `pnpm depcruise:graph` to generate `dependency-graph.svg`.
- It should pipe dependency-cruiser DOT output directly into `graphviz-cli`; avoid keeping intermediate `MODULES.dot`, `MODULES.mmd`, or generated Markdown wrapper files unless explicitly requested.
