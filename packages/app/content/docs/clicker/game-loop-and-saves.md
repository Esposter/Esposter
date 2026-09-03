---
title: Game loop and saves
description: The single 60 FPS game tick, click handling, autosave, and the normalized id-based save persisted per user to Azure blob or localStorage.
---

# Game Loop and Saves

Production runs on one worker-based game tick, and the entire game state is one `Clicker` entity in memory, persisted as a normalized id-based `ClickerSave` to a per-user Azure blob (authenticated) or localStorage (anonymous).

## How it works

`pages/clicker.vue` loads the save with `useReadClicker`, then `useTimers` starts two intervals through the shared `useWorkerInterval`, which schedules on `worker-timers` — a Web Worker, so production continues when the tab is backgrounded (browsers throttle main-thread timers there) — and clears the interval on unmount.

- the game tick — one 60 FPS interval calling `applyGameTick`: it computes each bought building's power once per tick, accumulates the building's lifetime `producedValue`, and adds the summed power to `pointCount`. Powers are read fresh every tick, so purchases apply on the next tick with no watch/teardown machinery.
- the autosave — saves the full state every 60 seconds.

Clicking the central item goes through the popup store: it adds `mousePower` points and spawns a floating `+N` popup at the cursor that despawns after 10 seconds.

```mermaid
flowchart TD
  click[click on item] -->|mousePower| points[clicker.pointCount]
  tick[60 FPS game tick] -->|sum of building powers / 60| points
  tick -->|per-building power / 60| produced[boughtBuilding.producedValue]
  buy[buy building / upgrade] --> save60[virtualClicker watch: immediate save]
  auto[60 s autosave timer] --> persist
  save60 --> persist{useSave + toClickerSave}
  persist -->|authed| blob[clicker.saveClicker → Azure blob userId/save]
  persist -->|anonymous| ls[localStorage ClickerStore]
  blob --> load[useReadClicker]
  ls --> load
  load -->|clickerSaveSchema + toClicker| clicker[in-memory Clicker]
```

**Save timing** — `useReadClicker` watches a `virtualClicker` computed that deep-omits `pointCount` and `producedValue`; only _manual_ state changes (purchases, type switches) trigger an immediate save, while the ever-ticking counters are picked up by the periodic autosave. The omitted view is reference-stabilized with `deepEqual` so the watch doesn't fire on every tick, and `useSave` stamps `updatedAt` on the serialized copy rather than the in-memory state so saving never re-triggers the watch.

**Normalized save data** — the save stores only what the player _did_: `boughtUpgrades` as `UpgradeId[]` and `boughtBuildings` as `{ id, amount, producedValue }[]` (the `ClickerSave` entity). On write, `toClickerSave` strips the in-memory definitions down to ids, and on load `toClicker` resolves them back through `UpgradeMap`/`BuildingMap` — so a balance change to the content maps reaches every existing save on its next load. The in-memory `Clicker` keeps full definition objects, leaving the effect engine and components untouched. Per the [latest-shape-only convention](/docs/architecture/persisted-data-latest-shape-only), there is no migration or self-heal path: a save that fails `clickerSaveSchema` (old shape, removed content ids) resets to a fresh game.

**Persistence** — `useSave` and `useReadData` are the app-wide single-blob-per-user pattern (shared with dungeons): authenticated users read/write through `clicker.readClicker` / `clicker.saveClicker` (generic blob-state procedures over the `clicker-assets` container, blob name `${userId}/save`, validated by `clickerSaveSchema`); anonymous users get the same state in localStorage under `ClickerStore`. Why games stay off the resource layer: [games integration](/docs/platform/rejected/games-integration).

## Procedures

| Procedure             | Auth | Input               | Purpose                        |
| --------------------- | ---- | ------------------- | ------------------------------ |
| `clicker.readClicker` | user | —                   | read the user's save blob      |
| `clicker.saveClicker` | user | `clickerSaveSchema` | overwrite the user's save blob |

`saveClicker` is also the trigger path for all ten clicker achievements: five save-count thresholds (1/5/10/100/1000) and five milestones whose `condition` reads the save payload ([unlock pipeline](/docs/achievements/unlock-pipeline)) — ClickerMillionaire / ClickerBillionaire / ClickerTrillionaire (`pointCount` at 1e6/1e9/1e12), ClickerArchitect (every building owned), and ClickerCompletionist (every upgrade bought). The 60-second autosave cadence works for the milestones: progress is evaluated at least once a minute while playing, and unlocks are idempotent.

## Key files

Paths relative to `packages/app`.

| File                                          | Role                                              |
| --------------------------------------------- | ------------------------------------------------- |
| `app/composables/clicker/useReadClicker.ts`   | load + hydrate save, immediate-save watch         |
| `app/composables/clicker/useTimers.ts`        | the game tick + autosave intervals                |
| `app/composables/shared/useWorkerInterval.ts` | worker-backed interval, cleared on unmount        |
| `app/services/clicker/applyGameTick.ts`       | per-tick production math (points + producedValue) |
| `app/services/clicker/save/toClickerSave.ts`  | serialize in-memory state to ids/counters         |
| `app/services/clicker/save/toClicker.ts`      | parse + hydrate ids back                          |
| `app/store/clicker/index.ts`                  | save root, `useSave` wiring                       |
| `app/store/clicker/popup.ts`                  | click handling + floating point popups            |
| `server/trpc/routers/clicker.ts`              | read/save + content-map procedures                |
| `shared/models/clicker/data/Clicker.ts`       | in-memory game state entity                       |
| `shared/models/clicker/data/ClickerSave.ts`   | persisted save entity + schema                    |

## Notes

- Time away from the page is compensated by [offline progress](/docs/clicker/offline-progress): the load path awards capped production for the gap since the save was last stamped.
- Storing ids rather than definitions is also what keeps a late-game blob small: a save carries a short id per bought upgrade instead of the whole upgrade object, which is an order of magnitude less to write on every autosave.
