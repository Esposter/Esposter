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

## 6.6: the deployed dev run (its run half)

Anonymous driven runs of `https://dev.esposter.com/genshin`, on the green Deploy of `ai/queue` at `417cf2678a`. The signed-in route answers only on a local server, so the runs are anonymous. Each run read the page for 240 s and counted its requests by host.

- Every request to `hosted.dev.esposter.com`: 787 in each of the three runs that read the full page, every one 200. The two runs that clicked into the character packs counted 890 and 787, every one 200. None had a doubled slash in its path (counted by the first three runs). The later runs did not count doubled slashes.
- `public-genshin-assets`: 0 requests in every run. The retired login mount `/data/genshin/login/recordings`: 0.
- The login's recordings: 42 requests for the 21 recordings, each requested twice, all to `hosted.dev.esposter.com`, all 200.
- Same-origin requests on `dev.esposter.com` are the app's own chunks, polyfills, `pwa/favicon-196.png`, `api/auth` and Cloudflare's beacon. The diagnostic run's path count holds no `/data/genshin/...` request.

The run half of 6.6 holds: every game request goes to the hosted origin and answers 200, and none reaches the retired bucket. Its zero console errors do not hold (see 6.8). 6.6 stays unticked, since emptying the bucket is the lead's.

## 6.8: the opening's loading bar on the deployed dev run

The bar is drawn only from the login's Preparing stage, which a click on the title starts. The title was clicked until the bar showed. A page-side MutationObserver logged every change of the bar's `aria-valuenow` (`genshin-observe.json` in the scratchpad's `deployed` folder):

- Drawn: the bar first reads 0 at 23.4 s after the page's start.
- Advances: 46 logged values, rising from 0 to 100 over 31.6 s, in steps of one or two points.
- Completes: 100 at 55.0 s. The bar is removed at 56.5 s, and "CLICK TO BEGIN" returns as the door's prompt at 55 s.

Task 6.8's own Verify is met by this run. The brief's zero-console-error criterion is not: every login run logged the same five errors, `THREE.TSL: TypeError: Expected a vec3 node, got null "ac()"`, from the login's lighting (`setupDirectLight` under `setupLights`). Each run also logged `timer.worker-mMntE4pv.js` as blocked by its response (`ERR_BLOCKED_BY_RESPONSE`). 6.8 stays unticked until those errors are fixed or the lead rules them out of 6.8.

One run (`genshin-bar-run2.json`) froze the bar at 67 from 28 s to 240 s, with every hosted response 200. Its `terrainTileWorker` was blocked by its response twice, and it logged a terrain-worker failure. The next two runs did not freeze, so this is one observation and not yet reproduced.

The first run of the page did not click the title, so no bar was drawn (`genshin-run.json`). A single early click, at 18 s (`genshin-bar-run.json`), did not start the Preparing stage either.

## 6.6: the dev bucket emptied

Before the emptying, the dev `public-genshin-assets` was listed by its top-level prefix against the dev `public-hosted-assets`. Every prefix the game reads held its objects in both; the old bucket's extra objects were versions no lock names. One prefix had no hosted copy: `parityObjects`, the parity loop's five reference objects, which `referencesPackCommand` now writes to the hosted bucket and `restoreManifestFiles` reads from the hosted origin. Each of the five was copied to the dev and prod hosted buckets, its bytes hashed against its name before the write and read back after it, and one answers 200 on both hosted domains. The dev `public-genshin-assets` was then emptied: 8,204 objects deleted, 0 left. The prod bucket waits for `main`.

## 5.1 and 5.2: the worker activates, controls its page and answers hosted objects from its cache

**Why the install failed.** The worker precached the build's app manifest, `_nuxt/builds/meta/<build id>.json`. Each deploy serves only its own manifest, so a worker whose build was superseded gets a 404 on that entry, and the precache (one file at a time) stops there and the worker never activates. The deployed dev worker's precache has 1053 entries and this one is the 231st. Against the live dev site, in a driven Chrome with `/sw.js` answered by that deployed worker:

- the worker unchanged: installing for about 20 s, then `installing` and `active` null and no controller;
- the same worker with that one entry removed: installs, activates and controls the page (about 55 s);
- the other URLs of that worker (1048 distinct, from its 1053 entries less the removed manifest and four icon entries written with a leading slash, which repeat a checked URL) all answer 200 on the live site, so removing the manifest entry is the whole difference. The per-entry probe results were not kept in the repo, so this record gives no count of the entries probed.

The fix (`packages/unplugin-pwa-nuxt`, the build test asserts it) leaves the app manifest out of the precache. The built `sw.js` of this change names no `_nuxt/builds/meta` entry and 1052 entries, 1048 distinct URLs.

**The driven run.** The local production build of `apps/web` (`pnpm -C apps/web build` with `CLOUDFLARE_ENV=dev`, so the hosted origin is `hosted.dev.esposter.com`), served by `pnpm start` with placeholder values for the app's environment variable names. A throwaway Chrome, driven over CDP, with the first visit to `/dungeons`, a reload and a second visit, then the network disconnected for the page and the worker:

- first visit: the worker is `activated` about 30 s after the navigation, and the page that installed it is `controlled` with no reload (5.2);
- the `hosted-assets` cache holds 76 objects once the preloader has run;
- reload: `controller` is set;
- second visit: 87 hosted responses, all 87 answered by the worker's cache, none from the disk cache or the network, and no fetch by the worker to a hosted origin;
- offline visit, network disconnected for the page and the worker: 87 hosted responses, all 87 answered by the worker's cache, none failed, no fetch by the worker to a hosted origin (5.1's claim, with the network disabled);
- no page exception, no worker error, no hosted request failed in the online visits.

**The offline app manifest (R9).** The same local production build (`CLOUDFLARE_ENV=dev`), served by `wrangler dev` on a free local port with the main checkout's `apps/web/.env` (its values are not recorded). A throwaway Chrome, in a fresh browser context, drives it: a visit to `/about` until the worker controls the page, a client navigation to `/privacy-policy` and back, a reload, and the two reads Nuxt makes of the app manifest (`builds/meta/<build id>.json` for `getAppManifest`, `builds/latest.json?<timestamp>` for the outdated-build check), made online. Then the browser's HTTP cache is cleared, the network is disconnected, `/about` is reloaded, the two reads are made again, and the page navigates to `/privacy-policy`. Client navigation and boot made no manifest request on these static pages, so the reads are replayed with Nuxt's own request shapes.

- before (the precache without a manifest route): the offline reads fail, `TypeError: Failed to fetch` for both, and the offline reload raises two page exceptions (`Failed to fetch` and `Event`);
- after: the offline reads answer 200 from the worker's stored copy, and the offline navigation records no request error and no page exception;
- the worker is `activated` and controls the page in both runs.

The offline reload still raises the two exceptions in both runs, and the stacks of the after run place them in the engine's loader, which fetches `_nuxt/engine/*.gltf` and `.jpeg` by url, files the precache leaves out on purpose. They are not manifest reads. The requests the reload reports as aborted are the online reads' own, which the navigation tore down.

**Not yet on the deployed dev site.** The Deploy of `ai/queue` is skipped: CI on the current head (`2251a4a81f`) is red in `scripts/src/workspace/oxlintPlugins.test.ts` (the `comments/no-over-width-comment` rule is not enabled), which is not this change. The same driven run against `https://dev.esposter.com` (`HOSTED=https://hosted.dev.esposter.com`) is the check once a Deploy carries this change.

## 6.8: the local production run, after the terrain-worker, embedder-policy and TSL fixes

The build is `CLOUDFLARE_ENV=dev pnpm -C apps/web build` at `ddeb84b392` (exit 0, 1m 06s), served by `wrangler dev --config .output/server/wrangler.json --port 8799` with `nodejs_compat` and `nodejs_compat_populate_process_env`. The eleven secret names are bound to placeholder values as `--var` arguments, and no secret is read. The `.env` file is not passed: under `--env-file` the environment validator in `apps/web/server/plugins/environment.ts` saw each secret as undefined, and every page answered 500. So `pnpm start` as written does not serve this build, and the preview's own configuration is the open point.

Headers, `curl -sI --max-time 30`:

- `/_nuxt/timer.worker-mMntE4pv.js`: `200`, `cross-origin-embedder-policy: credentialless`, `referrer-policy: no-referrer`.
- `/_nuxt/x.js` (missing): `404`, `cache-control: no-store`, `cross-origin-embedder-policy: credentialless`, `referrer-policy: no-referrer`.

A driven run of `/genshin` (the machine's Chrome, no `page.route` workaround):

- `timer.worker` loads twice, `200`, `credentialless`; `terrainTileWorker` loads `200`, `credentialless`; no terrain-worker failure, no request failure, no page error.
- `hosted.dev.esposter.com` answers all 733 requests `200` from the local origin, so the hosted origin's CORS needed no workaround.
- Console: two errors, so the zero-error criterion is not met. The first is a `404` for `/data/genshin/exports/index.json`, and the second is the app's `InvalidOperationError` that logs it. One warning: the loading screen has waited 20 seconds on character packs.
- The bar is drawn at 20 s at 0 and reaches 100 at 84 s. The title's `CLICK TO BEGIN` returns at 88 s, so the bar completes before the login scene.
- After the login scene, a second bar reads 67 from 90 s to the end of the run at 100 s.

The `404` is for `/data/genshin/exports/index.json`, under the base `GENSHIN_SCENE_EXPORT_BASE_URL` (`apps/web/shared/services/genshin/constants.ts`), which the `serveGenshinExtractions` module serves under `nuxt dev` alone. The production build passes an empty base outside development: `Index.client.vue` and `World.vue` do so. Both readers of that base, `useSceneExports` and `useCharacterAvatar`, return before `readSceneExportComponents` is called when the base is empty, and that function is the only one that reads `index.json`. So the paths traced here make no request for that file, and the source of the `404` is unidentified. Nothing here is changed for it.

6.8 stays unticked. Its Verify holds on both clauses, the lock's total in the section above and the bar completing before the login scene in this run, but the opening logs the two console errors from that `404`, so the zero-console-error criterion for this run is not met.
