---
title: Buildings and upgrades
description: The store panel — building tiers, price scaling, upgrade unlock conditions, and the buying flow.
---

# Buildings and Upgrades

Buildings are the passive producers (19 tiers, Cursor → Idleverse, each with a `basePrice` and a `baseValue` of points per second); upgrades are one-shot purchases whose effects multiply building or mouse power. Both are bought from the store drawer on the left; bought items appear in the inventory drawer on the right.

## How it works

The store list (`ClickerModelStoreList`) fetches `BuildingMap` and `UpgradeMap` through the clicker router on setup and hands them to the building/upgrade stores. Buildings are always visible; upgrades appear only when **unlocked** and disappear once bought, sorted by price.

- **Unlock conditions** — every upgrade carries `UnlockCondition[]`: own at least N of a building (`Target.Building` + amount), or own another upgrade (`Target.Upgrade`). `unlockedUpgrades` in the upgrade store evaluates all conditions against the save.
- **Price scaling** — buildings cost `trunc(basePrice * 1.15 ** owned)` (`PRICE_GROWTH` in `services/clicker/constants.ts`), the idle-game-standard exponential curve Cookie Clicker's `basePrice` tiers were designed for, recomputed from the owned count; upgrades have fixed prices. Selling does not exist.
- **Buying** — `createBoughtBuilding` / `createBoughtUpgrade` push into the save's `boughtBuildings` / `boughtUpgrades` arrays and decrement points. Affordability is enforced only by disabling the Buy button (`pointCount >= price`); the store actions themselves trust their callers.
- **Bulk buy** — a ×1/×10/×100 quantity toggle in the store header (`BUY_QUANTITIES`, `buyQuantity` in the building store). `getBuildingPriceForQuantity` sums the per-unit price over `owned … owned + quantity - 1` — summing the loop stays exact under any price formula — and `createBoughtBuilding` applies the whole batch as one mutation (one save trigger). Upgrades are unaffected (they're one-shot).
- **Stats** — each bought building's list item renders markdown stat lines (per-unit power, share of total production, lifetime `producedValue`) computed from the [effect engine](/docs/clicker/effect-engine).

Numbers render through `formatNumberLong` (`thousand`, `million`, … built by prefix × suffix composition up to nonagintillion).

## Data model

Content lives in `shared/assets/clicker/data/` as constant maps, typed by `satisfies` at compile time and covered by co-located tests for the ordering the type system can't express:

- `BuildingMap` — `Building` per `BuildingId`: `basePrice`, `baseValue`, flavor text (with [compiled variables](/docs/clicker/clicker-types)).
- `<Building>UpgradeMap` — one map per building, merged into `UpgradeMap` via `mergeObjectsStrict` (which fails the build on id collisions). An `Upgrade` has `price`, `effects: Effect[]`, `unlockConditions`, description + flavor text. Only Cursor and Grandma have upgrade lines today (including Cursor's cross-building "Thousand Fingers" tier); giving the other 17 buildings one is [deferred on icon art](/docs/clicker/deferred/all-building-upgrades).

## Procedures

| Procedure                 | Auth         | Input | Purpose                        |
| ------------------------- | ------------ | ----- | ------------------------------ |
| `clicker.readBuildingMap` | rate-limited | —     | serve the building definitions |
| `clicker.readUpgradeMap`  | rate-limited | —     | serve the upgrade definitions  |

## Key files

Paths relative to `packages/app`.

| File                                                 | Role                                           |
| ---------------------------------------------------- | ---------------------------------------------- |
| `shared/assets/clicker/data/BuildingMap.ts`          | building definitions                           |
| `shared/assets/clicker/data/upgrades/UpgradeMap.ts`  | merged upgrade definitions                     |
| `app/services/clicker/building/getBuildingPrice.ts`  | the exponential price curve                    |
| `app/store/clicker/building.ts`                      | prices, per-building power, stats, buying      |
| `app/store/clicker/upgrade.ts`                       | unlock evaluation, buying                      |
| `app/components/Clicker/Model/Store/List.vue`        | store panel; fetches + initializes both maps   |
| `app/components/Clicker/Model/Store/Header.vue`      | ×1/×10/×100 buy-quantity toggle                |
| `app/components/Clicker/Model/Building/ListItem.vue` | building row with stats + Buy                  |
| `app/components/Clicker/Model/Upgrade/ListItem.vue`  | upgrade row with Buy                           |
| `app/services/clicker/formatNumberLong.ts`           | long-word number notation (`formatNumberLong`) |

## Notes

- Prices are always derived from the owned count and never stored, so retuning the curve needs no save migration — the next purchase simply costs the new amount.
- The Cursor building's flavor text says it autoclicks every 10 seconds, but mechanically it is a plain 0.1/s producer like every other building.
- Upgrade icons are per-upgrade PNGs keyed by upgrade id (`app/assets/clicker/icons/upgrades/<building>/`), so an upgrade without art renders an empty icon slot. This is what gates the other 17 buildings' lines — see [all-building upgrades](/docs/clicker/deferred/all-building-upgrades).
