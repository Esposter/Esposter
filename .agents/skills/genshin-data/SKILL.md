---
name: genshin-data
description: Apply when adding or changing a dataset genshin-world reads — a game table, a word list, a fitted scene record or an authored world file — writing its builder, reader or the boundary that awaits it, running a genshin:assets, genshin:text or genshin:data publish, a fit or a parity loop that publishes, editing packages/genshin-world/src/generated/gameDataLock.json, scripts/src/services/gameData or packages/genshin-world/scripts, or testing anything that reads the game data. Esposter's hosted game data — the static datasets genshin-world reads, published to Blob storage under a committed lock.
---

# Genshin Data

How it works, from a builder's publish to a reader's fetch, the full lifecycle and every dataset's reader, is `openspec/specs/genshin/hosted-game-data/design.md`; this skill is the rules a change to a dataset follows.

## Settled — do not re-propose

- **Bundling or committing a dataset the browser reads**, however small, or importing one for a synchronous read (`references/settled-directions.md`).
- **Serving the data through the app**, a CDN in front of the account, or a Nitro mirror in development (`openspec/rejected/genshin/static-data-in-public-assets/design.md`, `openspec/rejected/infra/cdn-in-front-of-blob-storage/design.md`).
- **Per-version folders, per-dataset manifests, git-style trees or a mutable pointer blob** in place of the lock (`openspec/specs/genshin/hosted-game-data/design.md`, "Notes").
- **A test fixture holding a copy of a record** — `references/settled-directions.md`.
- **Deleting an authored file once it is published** — `references/settled-directions.md`.
- **A client-side hash check, or a prune at the end of each publish** — `openspec/specs/genshin/hosted-game-data/design.md` ("Integrity" and "Decisions").

## Rules

- **A dataset is a `GameDataset` member, and its builder returns its records by key (`GameDataBuild`)** and publishes them under the dataset's scope, never writing a file the package imports (`references/builders-and-publishing.md`).
- **A builder is proven by `--dry-run`, which needs no credential: `unchanged, no request made` after a rewire, `N records would be published` when its output moved, followed by the keys and index entries it adds, removes or changes and the paths its changed records differ at, most often first** — `references/builders-and-publishing.md`.
- **A record refitted alone is a key scope** — `references/publish-scopes.md`.
- **An authored world file is edited where it is committed, then published** with `pnpm -C scripts genshin:data authored`: the catalogue, each region's ground until a fit draws it, and the login's age rating (`references/publish-scopes.md`).
- **A reader is `readGameData(base, key, schema)` or `readGameDataEntry(base, indexKey, id, schema)`**, its key a leaf of the nested `GameDataKeys` constant the lock's generator writes, `packages/genshin-world/src/generated/gameDataKeys.ts`, and its schema `satisfies z.ZodType<T>` (the `zod` skill); a record holding several tables is parsed per field, each reader taking only its own.
- **A record is awaited at a boundary and handed down**, as a prop or an argument, and every function over it stays pure and synchronous: the world's gate (`WorldTables`), `GameOpening`, or the screen or system that first needs it (`references/readers-and-boundaries.md`).
- **The base is a required `gameDataBaseUrl` prop or argument**, never injected and never defaulted, so a screen mounted without it fails typecheck.
- **A step in `scripts` reads another step's publish through the lock on disk** (`readPublishedGameData`, or `readWorldData` for a world data file), never through `genshin-world`'s build, which `vpx` may load stale.
- **A suite or fixture reads at `GAME_DATA_LOCAL_BASE_URL`**, which the vitest setup and the parity page's middleware answer from the mirror; CI fills the mirror ahead of the shards, keyed on the lock, so a new key needs nothing of a test but its read.
- **`pnpm -C scripts genshin:data verify` follows every publish**, and must pass on both accounts (`references/verify-and-retirement.md`).

## Reference pages

- `references/builders-and-publishing.md` — when a dataset's builder is written, proven with `--dry-run`, or published.
- `references/publish-scopes.md` — when a publish replaces one key, or an authored world file is edited and published.
- `references/readers-and-boundaries.md` — when a record is awaited at a boundary, or a worker is posted the records it needs.
- `references/verify-and-retirement.md` — when a key or a dataset is retired, or `verify` and `prune` run.
- `references/settled-directions.md` — when a proposal matches a Settled line and its full statement is needed.
