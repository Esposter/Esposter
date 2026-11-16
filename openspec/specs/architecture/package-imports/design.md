# Package imports — design

## Context

Every package, the repo-root `scripts`, the repo root's own folders and the web app reach their own files through the subpath imports their manifest declares, and the lint bans anything else (the file-organization skill, `references/import-aliases.md`). Node, TypeScript, Vite, Nitro and Vitest all read a manifest's `imports`, so a specifier resolves to one file in every reader, and every `.ts` script runs under bare `node` (the package-scripts skill, `references/typescript-scripts.md`). Nuxt still generates its `@/`, `@@/`, `#shared/` and `#server/` aliases for its own modules.

## Decisions

### The web app declares its trees in its manifest

```json
"imports": {
  "#configuration/*": "./configuration/*.ts",
  "#package.json": "./package.json",
  "#scripts/*": "./scripts/*.ts",
  "#server/*": "./server/*.ts",
  "#shared/*": "./shared/*.ts",
  "#src/*.vue": "./app/*.vue",
  "#src/*.png": "./app/*.png",
  "#src/*": "./app/*.ts",
  "#uno.config": "./uno.config.ts"
}
```

The listing shows the shape; the manifest holds one `#src/*.<ext>` entry per extension the app imports or globs. `#src` is the name every package gives its source, so the app's `app/` folder takes it. A root file a module imports (the UnoCSS configuration, the manifest itself) takes a named entry of its own. Nuxt's `css` option is resolved by Nuxt from its own package, which cannot see the app's manifest, so it names the app's sheets through Nuxt's `@/` alias; it is a configuration value, not an import.

**Rejected — `#app/*` for the app's source:** Nuxt owns `#app`, which resolves to its own runtime; declaring it would shadow every import of Nuxt's runtime. **Rejected — keeping `@/` and `@@/` with a second script runner:** two ways of addressing source, and a runner kept only because Node cannot read one of them. **Rejected — tsconfig `paths` alone:** Node ignores them. **Rejected — removing the `vpx` binary:** it ships with vite-plus, which stays for tests, lint and builds; no script entry runs through it.

### No relative imports, configuration included

The app's configuration, `nuxt.config.ts`, `uno.config.ts` and their tests import through the same names: Nuxt's config loader and UnoCSS's `unconfig` both resolve a manifest's `imports`, so nothing in the app reaches a file by path. `#modules/*` names the app's local Nuxt modules and `#nuxt/*` its generated `.nuxt/`; Nuxt's own `#build` is not declared, since under Vitest it points at the test build's folder. The one path left is the configuration's read of `db-schema`'s source: Nuxt evaluates it at install, before any package is built, and a subpath import never targets a file outside its package, so the lint names that reach as a negated glob. A root config a sibling reads moves into a package export instead, as the formatter's did (`@esposter/configuration/oxfmt`).

### Nuxt's aliases and the manifest agree, and a test holds them to it

Vite and Nitro read Nuxt's `#shared` and `#server` aliases before the manifest's map, so both must name one folder: `apps/web/configuration/imports.test.ts` resolves each name both ways. Nuxt resolves a folder to its index where a subpath import does not, which is why every specifier names its file (`#src/store/achievement/index`). The lint refuses `@/`, `@@/`, `~/` and `~~/` in the app (`WEB_IMPORT_PATTERNS`), and `shared/`'s boundary ban names `#src/`.

### A `#` name takes no query; a query is a glob option

A subpath import substitutes the whole specifier into its pattern, query included, so `#src/a.html?raw` names `./app/a.html?raw.ts`. An image is imported plainly, its default export the URL (a glTF model through `assetsInclude`), and a `?raw`, `?url` or `?worker` read passes the query as an `import.meta.glob` option, which Vite resolves through the manifest natively in the build, the dev server and Vitest. A glob is never root-absolute in the app: Nuxt's Vite root is `app/` and Vitest's is `apps/web`, so `/…` names a different folder in each. A package specifier keeps its query (`genshin-world/terrainTileWorker?worker`), since a package export does not substitute it. The lint refuses a query on a `#` name in every tree.

Knip resolves a glob's alias through tsconfig `paths` only, never a manifest's `imports`, so `knip.config.ts` names the app's workers as entries, ignores `app/assets/**` and leaves the manifest's glob-only patterns unreported, each under a `@TODO` linking webpro-nl/knip#2399.

### Every script runs under `node`, and the test says so

`scripts/src/workspace/packageScripts.test.ts` holds it, through each importer's own manifest; what it fails and why no other check sees it is the package-scripts skill's `references/typescript-scripts.md`.

## Key files

| Path                                                            | Role                                                             |
| :-------------------------------------------------------------- | :--------------------------------------------------------------- |
| `apps/web/package.json`                                         | the web app's subpath imports and its `node` script entries      |
| `oxlint/importRestrictions.ts`                                  | `WEB_IMPORT_PATTERNS`: the old aliases and a query on a `#` name |
| `apps/web/configuration/imports.test.ts`                        | Nuxt's `#shared` and `#server` and the manifest reach one folder |
| `scripts/src/workspace/packageScripts.test.ts`                  | walks each `node` entry's modules; fails a `.ts` entry on `vpx`  |
| `knip.config.ts`                                                | the glob targets knip cannot resolve through the manifest        |
| `.agents/skills/file-organization/references/import-aliases.md` | the app's names, `/index` and queries as glob options            |
