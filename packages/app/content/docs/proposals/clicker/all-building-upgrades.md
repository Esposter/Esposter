---
title: All-building upgrades
description: Proposal — upgrade tiers for the 17 buildings that have none, using the existing per-building map pattern.
---

# All-Building Upgrades

Give every building an upgrade line. Only Cursor and Grandma have upgrade maps today, so from the Farm tier onward the store's upgrade section runs dry and the mid/late game loses its second purchase axis entirely — buildings alone reduce the game to "buy the biggest number".

## Scope

**Today:** `UpgradeMap = mergeObjectsStrict(CursorUpgradeMap, GrandmaUpgradeMap)`; the effect engine, unlock evaluation, store UI, and icon asset convention (`app/assets/clicker/icons/upgrades/<building>/<Upgrade Name>.png`) all already handle arbitrary upgrades — this is pure content.

**This adds:** one `<Building>UpgradeMap` per remaining building, merged into `UpgradeMap`, plus their icons.

## How it works

Follow the Grandma pattern per building (Cookie Clicker's standard line):

- A new `<Building>UpgradeId` enum + map file in `shared/assets/clicker/data/upgrades/`, entries built with `Multiplicative` value-2 effects targeting that building id.
- Unlock conditions at owned-count thresholds (1 / 5 / 25 / 50 / 100), prices at roughly 10× the building price at that threshold.
- Each map gets the sibling `.test.ts` validating entries against `createUpgradeSchema` (the Cursor/Grandma tests are the template).
- Merge each map into `UpgradeMap`; `mergeObjectsStrict` fails the build on id collisions.
- Optionally include cross-building synergy upgrades later; the effect engine's `BuildingAdditive`/`BuildingAdditiveNor` types already support them (Cursor's "Thousand fingers" line demonstrates it).

## Key files

Paths relative to `packages/app`.

| File                                                          | Change                             |
| ------------------------------------------------------------- | ---------------------------------- |
| `shared/assets/clicker/data/upgrades/<Building>UpgradeMap.ts` | new content map per building (×17) |
| `shared/models/clicker/data/upgrade/UpgradeId.ts`             | union the new id enums             |
| `shared/assets/clicker/data/upgrades/UpgradeMap.ts`           | merge the new maps                 |
| `app/assets/clicker/icons/upgrades/<building>/`               | icon per upgrade                   |

## Notes

- Save data is already normalized to ids ([game loop and saves](/docs/clicker/game-loop-and-saves)), so shipped content can still be rebalanced afterwards.
- Icons are the only non-mechanical cost; reusing the building's menu icon as a placeholder is acceptable for a first pass.
