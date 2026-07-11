---
title: Single game tick
description: Proposal — replace the per-building 60 FPS stat timers with one game-tick interval that applies production and stats in a single pass.
---

# Single Game Tick

Consolidate the production timers into one 60 FPS tick that both increments `noPoints` and accumulates each bought building's `producedValue`. Today `useBuildingStatsTimer` spawns **one 60 FPS worker interval per bought building** (19 possible), plus `useBuildingClickerTimer`'s production interval — and the stats composable tears down and recreates all of its intervals whenever the computed building powers change identity.

## Scope

**Today:** `useTimers` starts `useBuildingClickerTimer` (one interval: `noPoints += allBuildingPower / FPS`), `useBuildingStatsTimer` (N intervals: `producedValue += power / FPS`, rebuilt by a watch), and `useAutosaveTimer` (60 s save). Each interval is a `worker-timers` postMessage round-trip per tick.

**This adds:** nothing user-visible. One interval computes per-building powers once per tick, adds their sum to `noPoints`, and adds each share to its building's `producedValue`. The watch/teardown machinery disappears — powers are read fresh each tick, so purchases apply on the next tick automatically.

## How it works

Replace both production composables with a single `useGameTickTimer`:

- One `worker-timers` interval at `1000 / FPS`.
- Each tick: read `getBoughtBuildingPower` for every bought building (already memoized per tick by reading the same computed state), `incrementPoints(total / FPS)`, and `boughtBuilding.producedValue += power / FPS`.
- `allBuildingPower` stays a computed for display; the tick no longer depends on watch-driven timer rebuilds.
- `useTimers` keeps the autosave interval separate — persistence cadence is not the game tick.

## Key files

Paths relative to `packages/app`.

| File                                                 | Change                     |
| ---------------------------------------------------- | -------------------------- |
| `app/composables/clicker/useGameTickTimer.ts`        | new single tick composable |
| `app/composables/clicker/useBuildingClickerTimer.ts` | deleted (absorbed)         |
| `app/composables/clicker/useBuildingStatsTimer.ts`   | deleted (absorbed)         |
| `app/composables/clicker/useTimers.ts`               | start game tick + autosave |

## Notes

- Same effective rates, so no save or balance impact; `producedValue` totals continue seamlessly.
- Also removes a subtle staleness class: today a stats interval runs with the power captured at creation until the watch rebuilds it; the single tick always uses current power.
- If 60 FPS point updates ever show up in profiles (Vue reactivity on every tick), the tick constant is the one knob to turn — a natural follow-up, not part of this change.
