# Import aliases

Read when choosing an import specifier, when the alias ban fires on one, or when a composable import looks necessary. The rule itself — alias imports, never relative, and never a composable — is in `SKILL.md`; this page is the map of which alias reaches what, the enforcement's exemptions, and the composable imports that still need a specifier.

## The app's names

The web app addresses its own source through the subpath imports its manifest declares, like every package, so Node resolves every specifier Nuxt does and a script runs under bare `node`:

- `#src/` — `apps/web/app/`; `composables/`, `components/`, `store/`, `services/`, etc.
- `#shared/` — `apps/web/shared/` (**not** a `shared/` folder under `app/`); code both client and server read.
- `#server/` — `apps/web/server/`.
- `#scripts/`, `#configuration/` — the app's root folders; `#uno.config` and `#package.json` — the root files a module imports.

A specifier names its file: a folder is `#src/store/achievement/index`, since a subpath import never resolves a folder, and a file that is not TypeScript keeps its extension (`#src/components/Foo.vue`), each extension having its own `#src/*.<ext>` pattern. `#shared` and `#server` are also Nuxt's own aliases, which Vite reads first; `configuration/imports.test.ts` holds both to the manifest's folder. `@/`, `@@/`, `~/` and `~~/` are banned in imports — Nuxt still generates them, and a Nuxt option it resolves itself from its own package, the `css` entries, keeps `@/`.

**A `#` name takes no query.** The manifest substitutes the whole specifier into its pattern, so `#src/a.html?raw` names `./app/a.html?raw.ts`. An image's URL is its plain import; a `?raw`, `?url` or `?worker` read passes the query as a glob option, `takeOne(Object.values(import.meta.glob<string>("#src/…", { eager: true, import: "default", query: "?raw" })))`, a whole folder at once where it reads several (`TilesetUrlMap`). A package specifier keeps its query (`genshin-world/terrainTileWorker?worker`), since a package export does not substitute it.

Everywhere else — every `packages/*` and the repo-root `scripts/` — a tree addresses its own source through `#src/*` the same way (the `build` skill, `references/source-exports.md`).

## How the ban is enforced

Enforced by oxlint `no-restricted-imports` for every file in `apps/web` (`WEB_IMPORT_PATTERNS`), and for every `.ts` and `.vue` file in `packages/*` and every `.ts` file in the repo-root `scripts`, each against the map its own manifest declares — not only `src`, so a harness beside it reaches its files the same way: the world package's parity page declares `#parity/*` and its game data mirror `#scripts/*` in its manifest beside `#src/*`, and a Vite glob in it is root-absolute (`/src/…`, with the package as Vite's root) rather than `../src/…`. The root config's own folders, `oxlint/` and `vite/`, do the same through the root manifest's `#oxlint/*` and `#vite/*`, the same override covering them, while the root files beside them (`vite.config.ts` reaching `./oxlint.config.ts`) stay relative. Two things are exempt, sharing one override because the alias ban still applies to both: the generated `src/index.ts` barrel, which is not hand-written, and `.agents/**`, which is the one tree with no `imports` map to point at. `packages/configuration` is **not** exempt — it declares `#src/*` like every other package, its root `tsdown.config.ts` and `vitest.config.ts` included, and the bootstrap survives it because Node resolves the map to a `.ts` target it can already type-strip. Reaching up out of a package is the one exception anywhere, since no `#` map or package export points past its own root: the repo-root `package.json`, where each site carries an `oxlint-disable-next-line` saying so, and the app's generated `.nuxt/eslint.config.mjs`, which Nuxt writes at prepare time and which both `packages/configuration/eslint/index.*.js` entry configs import by relative path — `eslint/` is outside `src/`, so the rule never reaches them and they carry no directive. A Claude Code hooks module is exempt from the relative-specifier ban alone: `packages/genshin-mods` and `packages/genshin-persona/mod` keep every other restriction, since the engine refuses a subpath import at load (the mod override in `oxlint.config.ts`).

## The composable imports that stay

A **type** exported beside a composable (`PaginationCacheOptions`, `OnlineSubscribableContext`), which the auto-import does not carry, and a `*.test.ts` / `*.bench.ts` helper living under `composables/`, which the scan skips.
