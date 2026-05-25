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

All extend `rolldownConfigurationBrowser`. Node adds `platform: "node"`. Isomorphic adds `@rolldown/plugin-node-polyfills`.

## Global External List

Defined in `rolldownConfigurationBrowser.ts`. Controls what is NOT bundled into each package's dist:

```ts
external: [
  // All workspace packages — regex covers every @esposter/* automatically
  /@esposter\//u,
  // @esposter/db — Azure SDKs are peer deps
  "@azure/data-tables",
  "@azure/search-documents",
  "@azure/storage-blob",
  "@azure/web-pubsub",
  // @esposter/infra — Pulumi is a peer dep
  "@pulumi/azure-native",
  "@pulumi/pulumi",
  // @esposter/db-schema
  "zod",
  // @esposter/db-mock
  /^drizzle-kit/u,
  /^drizzle-orm/u,
  "@electric-sql/pglite",
];
```

### Key rules

- **`/@esposter\//u` covers all workspace packages** — never add individual `@esposter/foo` strings; the regex handles them all automatically.
- **All peer dependencies must be in the external list** — if a package has a `peerDependency`, that dep MUST appear in the external list (or be covered by a regex). Otherwise it gets bundled.
- **`dependencies` vs `peerDependencies`** — `dependencies` get bundled unless externalized; `peerDependencies` signal that the consumer provides them (and must be externalized to avoid duplicate copies).

## Azure Functions Special Case

`packages/azure-functions/rolldown.config.ts` replaces the external list entirely:

```ts
external: ["@azure/functions"],
```

This is **intentional** — the Azure Functions bundle must be self-contained for deployment (Azure Functions runtime provides only `@azure/functions`). Everything else is bundled, resulting in a ~4.4MB output. Do not change this without verifying the deployment strategy.

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
