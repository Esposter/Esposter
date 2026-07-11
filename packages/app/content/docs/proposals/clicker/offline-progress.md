---
title: Offline progress
description: Proposal — award capped production for time elapsed since the last save when the game loads.
---

# Offline Progress

Grant points for time spent away when the save loads. Today production only runs while the page is open, so an idle game punishes closing the tab — the single strongest retention mechanic of the genre (come back to a payout) is missing, and it costs one calculation at load.

## Scope

**Today:** `useReadClicker` loads the save and timers start from zero elapsed. The save entity (`AItemEntity`) carries an `updatedAt` field, but nothing refreshes it — `createSaveBlobStateProcedure` uploads the client payload verbatim, so `updatedAt` is whatever the entity was constructed with.

**This adds:** stamping `updatedAt = new Date()` in the save path (`useSave` wiring or a pre-serialize hook), then on load computing `elapsed = now - updatedAt`, awarding `allBuildingPower × min(elapsed, cap)` at a reduced rate, and showing a "welcome back" summary dialog. Autosave every 60 s then keeps the stamp within a minute of the real last-played moment.

## How it works

- In `useReadClicker`, after the save is hydrated: compute the award from the loaded state's building power (the effect-engine computeds work off the save, so power is available before any timer starts), then `incrementPoints(award)` and distribute per-building shares into `producedValue`.
- Constants per the named-limits rule: `OFFLINE_RATE = 0.5` (half production while away — keeps active play strictly better) and `OFFLINE_CAP` (e.g. 24 h) in `app/services/clicker/constants.ts`.
- Show the award in a small dialog (points gained, time away) — silent point jumps read as a bug.
- Unauth saves: localStorage state carries `updatedAt` through the same schema, so the identical path works offline-anonymous.
- Guard `elapsed > 0` against clock skew; skip the dialog under a minute.

## Key files

Paths relative to `packages/app`.

| File                                               | Change                            |
| -------------------------------------------------- | --------------------------------- |
| `app/composables/clicker/useReadClicker.ts`        | compute + apply the award on load |
| `app/services/clicker/constants.ts`                | `OFFLINE_RATE`, `OFFLINE_CAP`     |
| `app/components/Clicker/OfflineProgressDialog.vue` | welcome-back summary              |

## Notes

- The stamp is client-set (the save blob is client-authoritative everywhere anyway); a stricter variant would stamp it server-side in `createSaveBlobStateProcedure`, which would also benefit dungeons — decide at implementation.
- Deliberately no offline _stat_ accuracy claims — per-building `producedValue` gets proportional shares, which is close enough for a stat display.
