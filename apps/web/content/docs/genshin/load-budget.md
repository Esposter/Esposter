---
title: Load budget
description: What a screen loads before it shows, measured and held to a budget. Each awaited load step is a browser performance measure, and `genshin:parity load` prints the time to ready, the requests and game data fetched, and the renderer's and scene's counts against the screen's budget.
---

# Load budget

Each screen of the game is held to a budget for what it loads before it shows. The steps the loading awaits are measured by the browser under `genshin:load:<step>`, so DevTools' Performance panel draws them on its Timings track, and `pnpm -C scripts genshin:parity load <screen>` reads the same entries on the parity page and prints each figure against its budget. The steps this page times are the first frame's needs; the trims that bring them down are the [proposal](/docs/proposals/genshin/load-budget).

## What is measured

- **Load steps.** `measureLoadStep(name, promise)` times an awaited step from its call to its settling, as the measure `genshin:load:<name>`. The promise's result or rejection passes through unchanged, and a rejected step is measured too, with `detail: { isFailed: true }`. The start is a timestamp rather than a mark, since two steps of one name can run at once (each region's read is one `regions` step).
- **Time to ready.** The milliseconds from navigation start to the moment the parity page signals the screen ready, read by the page at that moment. The tool opening the page waits for the network to idle before it reads anything, and a screen can be ready well before that, so a figure read after the wait would count the time and the requests past ready.
- **Requests.** Every request the page made, from resource timing, with its transferred bytes. The game data among them is the requests under the hosted game data's base, and their bytes are the game data bytes the budget holds.
- **Renderer and objects.** The renderer's geometries, textures and programs, and the visible objects by kind, read once at ready the way the scene bench counts them. A screen with no scene at ready draws none, so its counts are zero.

## Running it

```bash
pnpm -C scripts genshin:parity load WorldScreen        # 1920 by 1080, the default
pnpm -C scripts genshin:parity load LoginScreen 1280 720
pnpm -C scripts genshin:parity load WorldScreen --dev  # the dev server, not a build
```

The command measures a production build of the parity page by default. It builds the page into the genshin-world package's `parity-build` folder through the root `vite.config.ts`'s `build:parity` task, whose cache replays the build while nothing the page reads has changed, then serves the build with Vite's preview server on a free port and loads the screen there. With `--dev` it skips the build and serves the parity page with Vite's dev server on a free port instead, so the same measures can be read on the dev server (see the decision below). The production build is the default because it is what a reader's browser loads: the dev server serves every module unbundled and transformed as it is asked for, which no reader pays. The screen is a fixture on the parity page, opened cold in a fresh browser, so its cache is empty. The command prints one meter row per figure: the value, its budget, the share used as a bar, and OVER when past it, then the measures slowest first, then the requests and the objects by kind. It exits non-zero when a figure checked here is over its budget. Time is checked only on the machine the budget names (`os.hostname()`); on any other machine the time is printed beside its row and does not fail.

## Reading the Timings track

Open the parity page (or the app) in DevTools' Performance panel, record the load, and the `genshin:load:*` measures appear on the Timings track as bars named by their step. A step's bar starts at its call and ends when its promise settles, so a long bar with nothing under it is a step waiting on a fetch or a compile, and a bar that starts late is a step that waited on an earlier one.

## Budgets

The budgets are written in `scripts/src/services/genshinParity/load/ScreenLoadBudgetMap.ts`, each at the figure measured on the budget's machine plus a tenth, rounded up. Lowering a budget is part of the commit that lowers the load; raising one needs its own reason.

The time column is checked on the budget's machine only. A screen's own load steps are named in its `measures` section when it has any: the world's are `world-gate` with each of its reads, `regions`, `terrain` from mount to ready, and `compile`; the login has none of its own, its reads belong to the opening, and the opening's are `opening`.

## How it works

```mermaid
flowchart LR
  BUILD["buildParityPage<br/>the build:parity task, replayed from vp's cache"] --> PREVIEW["startParityServer<br/>Vite preview on a free port, or the dev server with --dev"]
  PREVIEW --> STEP["each awaited load step<br/>measureLoadStep → genshin:load:step"]
  STEP --> READY["the screen signals ready"]
  READY --> READ["parity page reads the measures,<br/>resource timing, renderer and scene counts"]
  READ --> METER["genshin:parity load screen<br/>each figure against its budget"]
  METER -->|a count over, a time on its machine, or a failed step| FAIL["exit non-zero"]
  METER -->|within| PASS["meter printed"]
```

## Decisions

- **The opening's ready is its mount.** `GameOpening`'s fixture names no ready event, so the page is ready as the opening mounts and its `opening` steps are read as they stand then. Its fixture also reads the title logo and the login records at module load, so the game data is fetched before the page is ready and its steps are short.
- **The parity page raises the resource timing buffer.** The browser keeps 250 resource timings by default, and a world's load makes more requests than that, so the buffer is raised before the first request in `openParityPage`; without it the request and game data counts stop at the buffer.
- **Ready waits on the finest terrain tiles only.** The terrain reports ready once every finest-level tile the view wants is held or given up, and the coarser rings keep streaming after ready without holding it. `terrain` is the longest step of the world's ready, but most of it is the page's main thread rather than the tiles, as the decision on the terrain worker below gives.
- **The load is measured on a production build.** A production build bundles the worker and the page into a few chunks, as the app ships them, so its figures are the ones a reader's browser pays, where the dev server's are paid for modules served one at a time. The build is served by Vite's preview server with the same game data route as the dev server, so the requests and game data counts match what the page fetches; only the module graph differs.
- **The terrain worker imports only the generators it runs, and `terrain` is mostly the main thread's wait.** The worker reaches the engine through its `genshin-engine/terrainWorker` entry ([terrain](/docs/genshin/terrain)), so on the dev server it loads a few dozen modules where the engine's barrel brought a few hundred, three's renderer and the post passes among them, and starts about half a second sooner. Neither median moved past the runs' spread, three runs each on `WorldScreen` before the first view's compile below: production ready 28.3 s before (runs 28.3, 28.6, 28.3) and 28.7 s after (runs 28.7, 32.0, 28.3), `terrain` 24.9 and 25.3 s; dev ready 30.1 s before (runs 29.0, 30.1, 31.4) and 31.4 s after (runs 31.4, 35.9, 29.9), `terrain` 20.1 and 20.4 s. Timed inside the worker, each of the two computes its share of the first view's tiles in about half a second over the whole load, a tile in a few milliseconds. The rest of `terrain` waits on the page's main thread, where the tiles are asked for each frame and received, and where a worker's first messages wait to be delivered: a CPU profile of the production load has it held for most of the step by `createLandmarkCollider` building each landmark's octree as its region arrives, the oak's and the statue's, tens of thousands of triangles each, for about 11 and 5 s. The [proposal](/docs/proposals/genshin/load-budget) holds that build as a trim of its own.
- **Region data is served by the parity page, not read from its source path.** The fixture named `src/data/regions`, a source path only the unbundled dev server answers. On bundled dev each region's fetch answered `HTTP 404`, and the production preview 404ed it too: the production baseline drew 294 of 322 objects with `regions` failed. `parity/regionDataPlugin.ts` now serves `/regions/<id>.json` from `src/data/regions` on the dev server, its bundled mode and the preview, the way the app serves its region data from its public assets. A `publicDir` on `src/data` was tried and refused: Vite does not import JSON from a public directory, and the parity code does.
- **Bundled dev reads the world a little sooner, and neither the app nor the parity page takes it.** Three runs each on `WorldScreen` with `--dev`, every region loaded. Plain dev: ready median 27.9 s (runs 30.8, 27.9, 27.9), slowest steps `terrain` 19.2, `compile` 2.2 and `regions` 0.4 s. Bundled dev (`experimental: { bundledDev: true }` on the parity config): ready median 23.1 s (runs 23.1, 22.9, 23.2), slowest steps `terrain` 19.4, `compile` 2.2 and `regions` 0.5 s. Both read 312 of 322 objects with no failed step. The saving is about 4.8 s of startup, and terrain, the dominant step, is unchanged. The earlier 36.5 s and 10.6 s medians were measured with the region 404s and are retired. Neither config turns it on: the saving is startup and immaterial against the terrain wait, and `--dev` measures the dev server the app runs, which a bundled parity page would not.
- **The world compiles its first view before ready, and no more.** The `compile` step drew every object of the scene once more after the frame's own draw, unseen and unculled, and it was the longest step after the terrain: three production runs read it at a median of 2.5 s (runs 2.8, 2.5, 2.3 s), with ready at 29.0 s and the terrain at 25.2 s. `compileAsync` now waits for the next frame's own draw of the view and for the GPU, and reads at 17 ms (runs 17, 51, 10 ms), with ready at 25.5 s and the terrain at 24.7 s, so what ready waits on past the terrain fell from about 3.7 s to about 1.0 s. On the dev server `compile` fell from 2.4 s to 19 ms. The rest was first compiled after ready, as the proposal had it, and there the whole-scene draw was one frame of 2.3 s, which `stalls WorldScreen` caught as its cold orbit's slowest. With no draw of the rest, the programs at ready fell from 120 to 97, the geometries from 276 to 220 and the textures from 39 to 37, and four `stalls` runs built no program in the cold orbit, the second orbit or the 20 s walk, their slowest frame 41 ms against 45 ms with the whole-scene draw. Every landmark shares its kind's material, so the view holds every program a turn or a walk draws, and one it does not show builds as it is first drawn.
- **The gate reads only what the first frame reads.** Each of its reads was followed to its readers. The Frostbearing Tree's levels are read by an offer alone, so `useWorldOfferings` reads them as one is made and offers the bag as it stands once they arrive. The three tables an artifact is rolled and enhanced from are read by nothing in the world, so they left `StatTables`. The rest stays, each read by the first frame: the names and the material table make the save's bag, the stat tables the starting team's combatants, which sum every table left in them, the enemy and Adventure Rank tables the camps and the kits, the HUD's rects the HUD, Windrise's records the ground, the catalogue the regions in reach, and Mondstadt's animals and Frostbearing Trees stand in the world. The game data fell from 80 requests and 4569.2 KB to 76 and 4560.3 KB, and the page's requests from 135 to 131. The gate's reads run at once, so it takes about as long as its slowest: `world-gate` read a median of 77.5 ms before and 65.3 ms after on the production build, and 90.5 ms and 74.0 ms on the dev server, too short against the terrain to move ready. The region palettes are the one read left that the first view mostly does not draw, the [proposal](/docs/proposals/genshin/load-budget)'s next trim.
- **The time's machine is named by the budget.** The counts are the same on every machine and the milliseconds are not, so a budget names the machine it was measured on.

## Key files

| File                                                                     | Role                                                               |
| :----------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `packages/genshin-world/src/services/loading/measureLoadStep.ts`         | Times an awaited load step as `genshin:load:<name>`                |
| `packages/genshin-world/src/services/loading/constants.ts`               | `LOAD_STEP_MEASURE_PREFIX`, the one prefix the measures carry      |
| `packages/genshin-world/parity/benchLoad.ts`                             | The parity page's read at ready: measures, requests, scene counts  |
| `scripts/src/services/genshinParity/load/ScreenLoadBudgetMap.ts`         | Each screen's budget, by screen name                               |
| `scripts/src/services/genshinParity/commands/loadCommand.ts`             | The `load` command, beside `bench`                                 |
| `scripts/src/services/genshinParity/load/buildParityPage.ts`             | Builds the parity page for production through `build:parity`       |
| `scripts/src/services/genshinParity/load/startParityServer.ts`           | Serves the production build with Vite's preview, or the dev server |
| `packages/genshin-world/scripts/gameData/mirror/gameDataMirrorPlugin.ts` | The game data route, on the dev server and the preview server      |
| `packages/genshin-world/parity/regionDataPlugin.ts`                      | The region data route, on the dev server and the preview server    |
| `scripts/src/services/genshinParity/shared/formatLoadMeter.ts`           | The meter's rows, the measures and the exit rule                   |
| `scripts/src/services/genshinParity/shared/openParityPage.ts`            | Opens the page cold and raises the resource timing buffer          |
