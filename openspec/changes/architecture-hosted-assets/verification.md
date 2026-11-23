# Verification note

The evidence the change's tasks name, recorded where it was taken.

## 4.3 and 4.4: the Cache Rule and the origin's lifetime

GETs through `hosted.dev.esposter.com` with `curl -s -D - -o /dev/null`, after the Cache Rule's apply (`apps/infra/src/cloudflare/resources/rulesets/esposterComHostedAssetsCache.ts`):

- A published `.tsx`: the first GET is `cf-cache-status: MISS`, the second `HIT`. A `.json` does the same.
- Objects whose origin `Cache-Control` is `max-age=60`: after its 60 seconds the `.json` and the `.tsx` each answer `REVALIDATED`, so the rule's `respect_origin` mode keeps the origin's lifetime at the edge rather than overriding it.
- A HEAD is never cached and answers `DYNAMIC`, which is why each probe is a GET.
- An absent hash under `dungeons/` answers 404 on `hosted.dev.esposter.com` and on `hosted.esposter.com`, its body the bucket domain's own Not Found page.

## 6.5: Genshin's origin is the hosted domain

A driven run of the Genshin page on the dev server (`pnpm dev --port 3001`, Chrome under Playwright, the driven user signed in, the page read for 240 s after it mounted), on the rebuilt packages:

- `hosted.dev.esposter.com`: 154 requests, all 200, none with a doubled slash.
- `public-genshin-assets`: no request on any host.
- The region data and the login's recordings are served by the dev server's own `publicAssets` mounts (`apps/web/configuration/nitro.ts`), not the bucket. The recordings move with 6.7, and the region data is authored source the design keeps.

A first pass showed 408 character-pack requests as `//characterPacks/...` and 404 from the hosted origin: `new URL(origin).href` ends in a slash. `readCharacterPackPreloadSet` drops it, and the rerun is clean.

The local Miniflare bucket holds no `stats/resin` record, so `startGenshin` answers "is not stored in the game data" on the dev server, and the save panel stays on "Save not loaded". The hosted bucket holds the record (copied by 6.3), so the deployed run reads it.

## 6.7: the login recordings are the lock's `loginRecordings` scope

The 21 OGG files are published by `genshin:data recordings`, which reads its working folder (`{data-root}/login-recordings`, seeded once from the repository copies) and publishes it as one scope through the generic publish. The dry run first named 21 objects added, none removed or changed. The publish then stored all 21 in both environments before it committed the lock, and the keys file beside it:

- `loginRecordings: 21 records published, 21 objects uploaded to dev and 21 to prod`.
- The lock: 499 to 520 objects, 21 added at 989,006 bytes (0.94 MiB), none removed or changed; 37 indexes unchanged. Every added object is `.ogg` under `loginRecordings`.
- `pnpm -C scripts genshin:data verify` after the lock's commit: `dev: 7422 objects verified`, `prod: 7422 objects verified`, exit 0. The count before the change was 7401, and the 21 recordings make 7422.
- `git ls-files packages/genshin-world/src/data/login/recordings` returns 0 files, and `pnpm -C apps/web exec vitest run configuration/nitro` passes (1 test).

The login's music resolves each recording through the lock (`getLoginRecordingUrl`), and the `publicAssets` mount is removed.

Local driven run, on the dev server at `http://localhost:3011` (Chrome under Playwright, the driven user signed in, the page read for 240 s, the rebuilt packages): 42 requests for a login recording, every one to `hosted.dev.esposter.com` and every one 200. They name the 21 recordings, each twice, so the login's music loader ran twice in the run. No request reached the retired mount (`/data/genshin/login/recordings`) or `public-genshin-assets`. The page reached the login screen (`CLICK TO BEGIN`, `Welcome, Traveler!`). The first load of the dev server logs dependency-optimisation aborts (`ERR_ABORTED` on `node_modules/.cache/vite/deps`) and one dynamic-import failure from the cold cache; none is a request for game data. The save does not load locally, as in 6.5.

## 6.8: the lock's measured total, before the preload is turned on

The lock on disk (`packages/genshin-world/src/generated/gameDataLock.json`):

- 536 entries: 499 objects and 37 index entries, each a distinct object.
- 54,601,223 bytes (52.07 MiB).

The character packs are outside the lock, named by the index `characterPackIndex/index`:

- 13 avatars, 136 files, 84,982,707 bytes (81.05 MiB).

After the switch, the opening preloads the lock's objects and indexes and the character packs (`readGameDataPreloadSet`). A local driven run of the opening (dev server on port 3001, the same rebuilt packages, signed in, 240 s) recorded 690 requests to `hosted.dev.esposter.com`, all 200 and none with a doubled slash. The local save does not load (the local bucket has no `stats/resin` record), so the login's progress bar is not drawn there, and the bar's completion is measured on the deployed dev run recorded beside 6.6.

## 7.4: the bundle, before and after

`pnpm -C apps/web build` on both trees, each after its packages were built (`vp run build:packages`). Before is the base commit of the change, 4270035336. After is this change at its landed head. The totals are the bytes of every file under the `.output` folder of `apps/web` (2,001 files in both), and the `public` share is the bytes under `.output/public`.

- Before: 73,800,427 bytes in all, 42,285,160 bytes in `public`.
- After: 73,665,103 bytes in all, 42,266,731 bytes in `public`.
- Change: −135,324 bytes in all, −18,429 bytes in `public`.

The record itself (`bundle-sizes.md`) is written by the review of `ai/queue` from its Linux build, so this session does not write it.

## 2.7: the repair's dry runs

`pnpm -C scripts hosted-assets repair <product> --dry-run`, with the four R2 credentials in the command's own environment, on the tree of this change:

- `dungeons`: `nothing to copy`, exit 0.
- `GameData`: `nothing to copy`, exit 0.
