---
name: build
description: Esposter rolldown build conventions — shared rolldown configs, external list rules, bundle sizes, azure-functions special case. Apply when adding packages, editing rolldown configs, or optimizing bundle sizes.
---

# Build Conventions (Rolldown)

## Shared Rolldown Configs

Located in `packages/configuration/src/`. All library packages import one of:

| Config                            | Platform                 | Use for                                |
| --------------------------------- | ------------------------ | -------------------------------------- |
| `rolldownConfigurationBrowser`    | browser                  | `db-schema`, `shared`                  |
| `rolldownConfigurationNode`       | node                     | `db`, `azure-mock`, `infra`, `db-mock` |
| `rolldownConfigurationIsomorphic` | browser + node polyfills | `xml2js`, `parse-tmx`                  |

All extend `rolldownConfigurationBrowser`. Node adds `platform: "node"`. Isomorphic adds `@rolldown/plugin-node-polyfills`. Use `{ external }` shorthand when no extra entries needed; spread `[...external, "extra"]` only if the package requires additional externals.

## Global External List

Defined in `packages/configuration/src/external/external.ts`. Controls what is NOT bundled into each package's dist:

```ts
external: [
  // Workspace packages — never bundle sibling packages
  /@esposter\//u,
  "azure-mock",
  "parse-tmx",
  "vue-phaserjs",
  // @esposter/configuration
  "@rolldown/plugin-node-polyfills",
  "@vitejs/plugin-vue",
  "rolldown",
  "rolldown-plugin-dts",
  /^unplugin-auto-import/u,
  /^unplugin-dts/u,
  "vite",
  "vite-plugin-mkcert",
  // @esposter/db
  "@azure/data-tables",
  "@azure/search-documents",
  "@azure/storage-blob",
  "@azure/web-pubsub",
  // @esposter/db-mock
  "@electric-sql/pglite",
  /^drizzle-kit/u,
  /^drizzle-orm/u,
  // @esposter/db-schema
  "zod",
  // @esposter/infra
  "@pulumi/azure-native",
  "@pulumi/pulumi",
  // @esposter/vue-phaserjs
  "phaser",
  /^phaser4-rex-plugins/u,
  // Vue framework — always provided by the consumer (Nuxt app / Vue SPA)
  "@vueuse/core",
  "pinia",
  "vue",
];
```

### Key rules

- **`/@esposter\//u` covers all `@esposter/*` workspace packages automatically** — never add individual `@esposter/foo` strings.
- **Non-`@esposter/` workspace packages must be listed explicitly** — `azure-mock`, `parse-tmx`, `vue-phaserjs` are not covered by the regex.
- **Everything in the external list (except workspace packages) must be a `peerDependency`** — if a non-workspace dep is externalized, it must be in `peerDependencies`, not `dependencies`, in the owning package's `package.json`. Exceptions: `@esposter/app` (root consumer) and `@esposter/azure-functions` (overrides external list to bundle everything).
- **`dependencies` get bundled; `peerDependencies` are externalized** — the two must stay in sync with the shared external list. Never add a dep to `external` without also moving it to `peerDependencies` in the package that owns it.

### Ordering convention

Entries are grouped by **owning `@esposter` package**, sections in alphabetical package-name order, entries alphabetical within each section. One exception: a final "Vue framework" group for deps that are always consumer-provided and not owned by a single package (`@vueuse/core`, `pinia`, `vue`). Each section header comment is the bare package name: `// @esposter/db`, `// @esposter/db-mock`, etc.

### Auditing external vs peerDependencies alignment

Run this from the repo root to find any `dependencies` entry that should be a `peerDependency`:

```js
const fs = require("fs"),
  path = require("path");
const externalStrings = [
  "@azure/data-tables",
  "@azure/search-documents",
  "@azure/storage-blob",
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
const skip = new Set(["@esposter/app", "@esposter/azure-functions"]);
for (const dir of fs.readdirSync("packages")) {
  const p = path.join("packages", dir, "package.json");
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

- **`externalVueFramework`** (`vue`, `@vueuse/core`, `pinia`) — peer deps of `@esposter/shared`/`@esposter/vue-phaserjs`; azure-functions doesn't use Vue so rolldown tree-shakes these out safely.
- **Everything else is bundled** — the Azure Functions runtime provides only `@azure/functions`; all other deps (Azure SDKs, drizzle-orm, zod, postgres, @esposter/\* packages) must be in the bundle.
- Do not spread the full `external` list here — it includes `/@esposter\//u` which would externalize `@esposter/db`, `@esposter/shared`, etc., breaking runtime.

## Bundle Sizes (Baselines)

| Package                     | Size    | Notes                        |
| --------------------------- | ------- | ---------------------------- |
| `@esposter/infra`           | ~124KB  | Pulumi resources, external   |
| `@esposter/db-schema`       | ~66KB   | Schema only                  |
| `@esposter/db-mock`         | ~886B   | Re-exports                   |
| `@esposter/shared`          | ~461KB  | Utilities                    |
| `@esposter/db`              | ~1.1MB  | Azure SDKs external          |
| `@esposter/azure-mock`      | ~1.1MB  | Includes pglite peer         |
| `@esposter/xml2js`          | ~1.1MB  | Bundles sax + xmlbuilder2    |
| `@esposter/configuration`   | ~1.56MB | ESLint plugins + build tools |
| `@esposter/vue-phaserjs`    | ~1.6MB  | Bundles Phaser               |
| `@esposter/parse-tmx`       | ~800KB  | xml2js now external          |
| `@esposter/azure-functions` | ~4.4MB  | Intentionally self-contained |

## Adding a New Package

1. Create `rolldown.config.ts` importing the appropriate base config.
2. Add to `package.json`: `"build": "pnpm export:gen && rolldown --config rolldown.config.ts"`.
3. For any dep that the consumer should provide, add it to `peerDependencies` AND verify it's covered by the global external list (or add it there).
4. Add `src/index.test.ts` bundle size snapshot (see testing skill).
5. Add `test`/`coverage` scripts + `vitest`, `@vitest/coverage-v8`, `@types/node` to `devDependencies`.
6. Run `pnpm install` from workspace root after editing `package.json`.
