# Verification note

The evidence the change's tasks name, recorded where it was taken.

## 6.5: Genshin's origin is the hosted domain

A driven run of the Genshin page on the dev server (`pnpm dev --port 3001`, Chrome under Playwright, the driven user signed in, the page read for 240 s after it mounted), on the rebuilt packages:

- `hosted.dev.esposter.com`: 154 requests, all 200, none with a doubled slash.
- `public-genshin-assets`: no request on any host.
- The region data and the login's recordings are served by the dev server's own `publicAssets` mounts (`apps/web/configuration/nitro.ts`), not the bucket. The recordings move with 6.7, and the region data is authored source the design keeps.

A first pass showed 408 character-pack requests as `//characterPacks/...` and 404 from the hosted origin: `new URL(origin).href` ends in a slash. `readCharacterPackPreloadSet` drops it, and the rerun is clean.

The local Miniflare bucket holds no `stats/resin` record, so `startGenshin` answers "is not stored in the game data" on the dev server, and the save panel stays on "Save not loaded". The hosted bucket holds the record (copied by 6.3), so the deployed run reads it.

## 6.8: the lock's measured total, before the preload is turned on

The lock on disk (`packages/genshin-world/src/generated/gameDataLock.json`):

- 536 entries: 499 objects and 37 index entries, each a distinct object.
- 54,601,223 bytes (52.07 MiB).

The character packs are outside the lock, named by the index `characterPackIndex/index`:

- 13 avatars, 136 files, 84,982,707 bytes (81.05 MiB).

After the switch, the opening preloads the lock's objects and indexes and the character packs (`readGameDataPreloadSet`). A local driven run of the opening (dev server on port 3001, the same rebuilt packages, signed in, 240 s) recorded 690 requests to `hosted.dev.esposter.com`, all 200 and none with a doubled slash. The local save does not load (the local bucket has no `stats/resin` record), so the login's progress bar is not drawn there, and the bar's completion is measured on the deployed dev run recorded beside 6.6.

## 7.4: the bundle, before and after

`pnpm -C apps/web build` on both trees, each after its packages were built (`vp run build:packages`). Before is the base commit of the change, 4270035336. After is this change at its landed head. The totals are the bytes of every file under `apps/web/.output` (2,001 files in both), and the `public` share is the bytes under `.output/public`.

- Before: 73,800,427 bytes in all, 42,285,160 bytes in `public`.
- After: 73,665,103 bytes in all, 42,266,731 bytes in `public`.
- Change: −135,324 bytes in all, −18,429 bytes in `public`.

The record itself (`bundle-sizes.md`) is written by the review of `ai/queue` from its Linux build, so this session does not write it.
