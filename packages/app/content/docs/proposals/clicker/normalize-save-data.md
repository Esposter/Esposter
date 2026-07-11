---
title: Normalize save data
description: Proposal — persist bought upgrades/buildings as ids and counters instead of full definition objects, so content rebalances reach existing saves.
---

# Normalize Save Data

Store only what the player _did_ (which upgrades they own, how many of each building, lifetime production) and resolve the definitions from `UpgradeMap`/`BuildingMap` at load. Today the save blob embeds full `Upgrade` objects (effects, prices, descriptions) and full `Building` objects, so any balance change to the content maps silently never applies to existing saves — old effects keep running from the blob — and tightening a definition schema can invalidate every stored save.

## Scope

**Today:** `Clicker.boughtUpgrades: Upgrade[]` and `boughtBuildings: BuildingWithStats[]` (full `Building` + `amount` + `producedValue`), validated by `clickerSchema` on save; every consumer (effect engine, stores) reads the stored objects.

**This adds:** a save shape of `boughtUpgrades: UpgradeId[]` and `boughtBuildings: { id: BuildingId; amount: number; producedValue: number }[]`, hydration at load, and a one-time migration for existing saves. No gameplay change.

## How it works

- Change `clickerSchema` (and the `Clicker` entity) to the id-based shape above.
- In `useReadClicker` (and the unauth localStorage path), hydrate: map stored ids through `UpgradeMap` / `BuildingMap` into the in-memory shape the stores already use, dropping ids that no longer exist in the maps (content removals then self-heal saves).
- Keep the in-memory store shape as-is (full objects) so the effect engine and components are untouched — only the persistence boundary converts. `useSave` serializes back to ids on write (a `toSaveData` companion beside the schema).
- **Migration:** on read, accept both shapes (union schema); if the legacy shape is detected, convert by extracting `id` / `{ id, amount, producedValue }` and re-save. After a deploy cycle the legacy arm can be deleted.

## Key files

Paths relative to `packages/app`.

| File                                        | Change                                       |
| ------------------------------------------- | -------------------------------------------- |
| `shared/models/clicker/data/Clicker.ts`     | id-based schema + legacy-shape migration arm |
| `app/composables/clicker/useReadClicker.ts` | hydrate ids → definitions on load            |
| `app/store/clicker/index.ts`                | serialize to ids in the `useSave` wiring     |
| `server/trpc/routers/clicker.ts`            | `saveClicker` validates the new schema       |

## Notes

- This is the prerequisite for any rebalance work ([building price curve](/docs/proposals/clicker/building-price-curve), [all-building upgrades](/docs/proposals/clicker/all-building-upgrades)) actually reaching players.
- Blob size shrinks by an order of magnitude for late-game saves (19 full upgrade objects → 19 short ids).
- Failure semantics: hydration of an unknown id drops it silently — strictly better than today, where a stale stored object keeps applying effects that no longer exist in the content maps.
