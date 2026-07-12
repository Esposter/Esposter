---
title: Building price curve
description: Proposal — make building prices grow exponentially per owned unit instead of the current near-linear polynomial curve.
---

# Building Price Curve

Change `getBuildingPriceAtAmount` from `basePrice * (1 + owned) ** 1.15` to the idle-game-standard `basePrice * 1.15 ** owned`. The current formula raises the _count_ to the power 1.15 (polynomial), so prices barely grow: the 100th Cursor costs ~15 × 200 ≈ 3,000 points while its production scales linearly — late game, every building is effectively free, which collapses the buy-decision loop that makes idle games engaging.

## Scope

**Today:** `getBuildingPriceAtAmount` in `app/store/clicker/building.ts` is the only price site (`getBuildingPriceForQuantity` sums it for list rendering and `createBoughtBuilding`). Prices are always derived from the owned count, never stored.

**This adds:** the exponential curve, one constant (`PRICE_GROWTH = 1.15`) in `app/services/clicker/constants.ts` per the named-constants rule.

## How it works

```ts
const getBuildingPriceAtAmount = (building: Building, amount: number) =>
  Math.trunc(building.basePrice * PRICE_GROWTH ** amount);
```

Since prices are derived, existing saves need no migration — owned counts stay valid and the next purchase simply costs the rebalanced amount. `basePrice` tiers in `BuildingMap` already mirror Cookie Clicker's, which were designed for this exact growth rate, so no per-building retuning is needed.

## Key files

Paths relative to `packages/app`.

| File                                | Change                                 |
| ----------------------------------- | -------------------------------------- |
| `app/store/clicker/building.ts`     | exponential `getBuildingPriceAtAmount` |
| `app/services/clicker/constants.ts` | `PRICE_GROWTH` constant                |

## Notes

- Players mid-game will see prices jump up; that is the point — the current curve trivializes progression rather than pacing it.
- [Bulk buy](/docs/clicker/bulk-buy) already sums per-unit prices in a loop, so it stays exact under this curve with no changes.
