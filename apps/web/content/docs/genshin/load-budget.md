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
```

The command measures a production build of the parity page, not the dev server. It builds the page into `packages/genshin-world/parity-build` through a run slot, reuses that build while nothing it reads has changed (its key is the commit and each changed file's size and time), then serves the build with Vite's preview server on a free port and loads the screen there. The dev server is not used for the measure because its unbundled modules are slow to start: the terrain worker waited seconds to begin on it, which hid every other step's cost. The screen is a fixture on the parity page, opened cold in a fresh browser, so its cache is empty. The command prints one meter row per figure: the value, its budget, the share used as a bar, and OVER when past it, then the measures slowest first, then the requests and the objects by kind. It exits non-zero when a figure checked here is over its budget. Time is checked only on the machine the budget names (`os.hostname()`); on any other machine the time is printed beside its row and does not fail.

## Reading the Timings track

Open the parity page (or the app) in DevTools' Performance panel, record the load, and the `genshin:load:*` measures appear on the Timings track as bars named by their step. A step's bar starts at its call and ends when its promise settles, so a long bar with nothing under it is a step waiting on a fetch or a compile, and a bar that starts late is a step that waited on an earlier one.

## Budgets

The budgets are written in `scripts/src/services/genshinParity/load/ScreenLoadBudgetMap.ts`, each at the figure measured on the budget's machine plus a tenth, rounded up. Lowering a budget is part of the commit that lowers the load; raising one needs its own reason.

The time column is checked on the budget's machine only. A screen's own load steps are named in its `measures` section when it has any: the world's are `world-gate` with each of its reads, `regions`, `terrain` from mount to ready, and `compile`; the login has none of its own, its reads belong to the opening, and the opening's are `opening`.

## How it works

```mermaid
flowchart LR
  BUILD["buildParityPage<br/>production build, reused by key"] --> PREVIEW["startParityPreview<br/>Vite preview on a free port"]
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
- **Ready waits on the finest terrain tiles only.** The terrain reports ready once every finest-level tile the view wants is held or given up, and the coarser rings keep streaming after ready without holding it. On the production build the world's ready is mostly that wait, so the next trim is chosen from the terrain measure, see the proposal.
- **The load is measured on a production build.** On the dev server each terrain worker waited seconds before it ran its first load, since the engine's barrel was served as a waterfall of unbundled modules, so every figure read on it was dominated by that start. A production build bundles the worker and the page into a few chunks, and the same world reads ready far sooner than on the dev server. The build is served by Vite's preview server with the same game data route as the dev server, so the requests and game data counts match what the page fetches; only the module graph differs.
- **The time's machine is named by the budget.** The counts are the same on every machine and the milliseconds are not, so a budget names the machine it was measured on.

## Key files

| File                                                                     | Role                                                              |
| :----------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/src/services/loading/measureLoadStep.ts`         | Times an awaited load step as `genshin:load:<name>`               |
| `packages/genshin-world/src/services/loading/constants.ts`               | `LOAD_STEP_MEASURE_PREFIX`, the one prefix the measures carry     |
| `packages/genshin-world/parity/benchLoad.ts`                             | The parity page's read at ready: measures, requests, scene counts |
| `scripts/src/services/genshinParity/load/ScreenLoadBudgetMap.ts`         | Each screen's budget, by screen name                              |
| `scripts/src/services/genshinParity/commands/loadCommand.ts`             | The `load` command, beside `bench`                                |
| `scripts/src/services/genshinParity/load/buildParityPage.ts`             | Builds the parity page for production, keyed so a build is reused |
| `scripts/src/services/genshinParity/load/startParityPreview.ts`          | Serves the production build with Vite's preview server            |
| `packages/genshin-world/scripts/gameData/mirror/gameDataMirrorPlugin.ts` | The game data route, on the dev server and the preview server     |
| `scripts/src/services/genshinParity/shared/formatLoadMeter.ts`           | The meter's rows, the measures and the exit rule                  |
| `scripts/src/services/genshinParity/shared/openParityPage.ts`            | Opens the page cold and raises the resource timing buffer         |
