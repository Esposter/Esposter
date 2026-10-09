---
name: genshin-data
description: Apply when adding or changing a dataset genshin-world reads — a game table, a word list, a fitted scene record or an authored world file — writing its builder, reader or the boundary that awaits it, running a genshin:assets, genshin:text or genshin:data publish, a fit or a parity loop that publishes, editing packages/genshin-world/src/generated/gameDataLock.json, scripts/src/services/gameData or packages/genshin-world/scripts, or testing anything that reads the game data. Esposter's hosted game data — every static dataset published to Blob storage as content-addressed objects under a committed lock, read by key with a schema at an async boundary, and read by the suites through a local mirror.
---

# Genshin Data

How it works, from a builder's publish to a reader's fetch, the full lifecycle and every dataset's reader, is `apps/web/content/docs/genshin/hosted-game-data.md`; this skill is the rules a change to a dataset follows.

## Settled — do not re-propose

- **Bundling or committing a dataset the browser reads**, however small, or importing one for a synchronous read. Every read crosses an async boundary instead; the two left in the bundle, the lock and the save schema's achievement bound, are the page's "What stays in the package" and why.
- **Serving the data through the app**, a CDN in front of the account, or a Nitro mirror in development (`apps/web/content/docs/genshin/rejected/static-data-in-public-assets.md`, `apps/web/content/docs/infra/rejected/cdn-in-front-of-blob-storage.md`).
- **Per-version folders, per-dataset manifests, git-style trees or a mutable pointer blob** in place of the lock (the page's Notes).
- **A test fixture holding a copy of a record.** A suite reads the real record through the mirror; a stub stands in only where a test asserts a rule over a value no record holds.
- **Deleting an authored file once it is published.** Its edits stay plain file edits with history; the page's Decisions.
- **A client-side hash check, or a prune at the end of each publish.**

## Rules

- **A dataset is a `GameDataset` member, and its builder returns its records by key (`GameDataBuild`)** and publishes them under the dataset's scope, never writing a file the package imports. A record the code names by itself gets its own key (`stats/weapons`), and a set read one entity at a time is an index by id (`profile/<Language>`).
- **A builder is proven by `--dry-run`, which needs no credential: `unchanged, no request made` after a rewire, `N records would be published` when its output moved.** A real publish needs `az login`, writes the lock only once both accounts hold every object, and the lock is committed at once with the publish's report in its body.
- **A record refitted alone is a key scope.** `genshin:assets fit <component> --only <part>`, the parity loops (`publishGameDataRecord`) and `genshin:data authored` each replace one key and keep the rest of its dataset; a bare dataset is never passed as a key (`toGameDataKeyScopes`).
- **An authored world file is edited where it is committed, then published** with `pnpm -C scripts genshin:data authored`: the catalogue, the regions' grounds and the login's age rating. The bundle never imports it.
- **A reader is `readGameData(base, key, schema)` or `readGameDataEntry(base, indexKey, id, schema)`**, its key typed off the lock and its schema `satisfies z.ZodType<T>` (the `zod` skill); a record holding several tables is parsed per field, each reader taking only its own.
- **A record is awaited at a boundary and handed down**, as a prop or an argument, and every function over it stays pure and synchronous: the world's gate (`WorldTables`), `GameOpening`, or the screen or system that first needs it. Nothing reads at module scope, and a worker is posted the records it needs before its first request (`TerrainWorkerGround`).
- **The base is a required `gameDataBaseUrl` prop or argument**, never injected and never defaulted, so a screen mounted without it fails typecheck.
- **A step in `scripts` reads another step's publish through the lock on disk** (`readPublishedGameData`, or `readWorldData` for a world data file), never through `genshin-world`'s build, which `tsx` may load stale.
- **A suite or fixture reads at `GAME_DATA_LOCAL_BASE_URL`**, which the vitest setup and the parity page's middleware answer from the mirror; CI fills the mirror ahead of the shards, keyed on the lock, so a new key needs nothing of a test but its read.
- **`pnpm -C scripts genshin:data verify` follows every publish**, and must pass on both accounts. A key is retired by deleting its lock line, a dataset by removing its `GameDataset` member; `genshin:data prune` runs on demand and takes only what no live lock has named for 90 days.
