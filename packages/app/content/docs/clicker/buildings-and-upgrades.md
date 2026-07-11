---
title: Buildings and upgrades
description: The store panel — building tiers, price scaling, upgrade unlock conditions, and the buying flow.
---

# Buildings and Upgrades

Buildings are the passive producers (19 tiers, Cursor → Idleverse, each with a `basePrice` and a `baseValue` of points per second); upgrades are one-shot purchases whose effects multiply building or mouse power. Both are bought from the store drawer on the left; bought items appear in the inventory drawer on the right.

## How it works

The store list (`Clicker/Model/Store/List.vue`) fetches `BuildingMap` and `UpgradeMap` through the clicker router on setup and hands them to the building/upgrade stores. Buildings are always visible; upgrades appear only when **unlocked** and disappear once bought, sorted by price.

- **Unlock conditions** — every upgrade carries `UnlockCondition[]`: own at least N of a building (`Target.Building` + amount), or own another upgrade (`Target.Upgrade`). `unlockedUpgrades` in the upgrade store evaluates all conditions against the save.
- **Price scaling** — buildings cost `trunc(basePrice * (1 + owned) ** 1.15)`, recomputed from the owned count; upgrades have fixed prices. Selling does not exist.
- **Buying** — `createBoughtBuilding` / `createBoughtUpgrade` push into the save's `boughtBuildings` / `boughtUpgrades` arrays and decrement points. Affordability is enforced only by disabling the Buy button (`noPoints >= price`); the store actions themselves trust their callers.
- **Stats** — each bought building's list item renders markdown stat lines (per-unit power, share of total production, lifetime `producedValue`) computed from the [effect engine](/docs/clicker/effect-engine).

Numbers render through `formatNumberLong` (`thousand`, `million`, … built by prefix × suffix composition up to nonagintillion).

## Data model

Content lives in `shared/assets/clicker/data/` as constant maps validated by tests against the Zod schemas:

- `BuildingMap` — `Building` per `BuildingId`: `basePrice`, `baseValue`, flavor text (with [compiled variables](/docs/clicker/clicker-types)).
- `CursorUpgradeMap`, `GrandmaUpgradeMap` — merged into `UpgradeMap` via `mergeObjectsStrict`. An `Upgrade` has `price`, `effects: Effect[]`, `unlockConditions`, description + flavor text. Only Cursor and Grandma have upgrade tiers today; the remaining 17 buildings have none (see [roadmap](/docs/clicker/roadmap)).

## Procedures

| Procedure                 | Auth         | Input | Purpose                        |
| ------------------------- | ------------ | ----- | ------------------------------ |
| `clicker.readBuildingMap` | rate-limited | —     | serve the building definitions |
| `clicker.readUpgradeMap`  | rate-limited | —     | serve the upgrade definitions  |

## Key files

Paths relative to `packages/app`.

| File                                                 | Role                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `shared/assets/clicker/data/BuildingMap.ts`          | building definitions                                                 |
| `shared/assets/clicker/data/upgrades/UpgradeMap.ts`  | merged upgrade definitions                                           |
| `app/store/clicker/building.ts`                      | prices, per-building power, stats, buying                            |
| `app/store/clicker/upgrade.ts`                       | unlock evaluation, buying                                            |
| `app/components/Clicker/Model/Store/List.vue`        | store panel; fetches + initializes both maps                         |
| `app/components/Clicker/Model/Building/ListItem.vue` | building row with stats + Buy                                        |
| `app/components/Clicker/Model/Upgrade/ListItem.vue`  | upgrade row with Buy                                                 |
| `app/services/clicker/format.ts`                     | long/short number notation (`formatNumberShort` is currently unused) |

## Notes

- The price exponent applies to the owned count, not compounding per purchase — growth is polynomial (`(1 + n) ** 1.15`), far flatter than Cookie Clicker's exponential `1.15 ** n`. The [building price curve](/docs/proposals/clicker/building-price-curve) proposal covers rebalancing this.
- The Cursor building's flavor text says it autoclicks every 10 seconds, but mechanically it is a plain 0.1/s producer like every other building.
