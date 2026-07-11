---
title: Bulk buy
description: Proposal — a ×1/×10/×100 purchase-quantity toggle with geometric-series pricing for buildings.
---

# Bulk Buy

A quantity toggle (×1 / ×10 / ×100) in the store header so late-game players stop clicking Buy a hundred times per building tier. Standard idle-game quality-of-life; purely client-side.

## Scope

**Today:** `createBoughtBuilding` buys exactly one unit at `getBuildingPrice`; the Buy button shows the single-unit price.

**This adds:** a `buyQuantity` ref in the building store, a summed price for N sequential purchases, and a Buy button that purchases N at once. Upgrades are unaffected (they're one-shot).

## How it works

- Store: `getBuildingPriceForQuantity(building, quantity)` sums the per-unit price formula over `owned … owned + quantity - 1`. With the [exponential curve](/docs/proposals/clicker/building-price-curve) this closes to a geometric series, but summing the loop is simpler and exact under either formula — keep the loop.
- `createBoughtBuilding(building, quantity)` decrements the summed price and adds `quantity` to `amount` in one mutation (one save trigger, one popup).
- UI: a small `v-btn-toggle` in `Store/Header.vue`; `Building/ListItem.vue` shows the summed price and disables Buy when `noPoints` can't cover it.

## Key files

Paths relative to `packages/app`.

| File                                                 | Change                          |
| ---------------------------------------------------- | ------------------------------- |
| `app/store/clicker/building.ts`                      | quantity state + summed pricing |
| `app/components/Clicker/Model/Store/Header.vue`      | quantity toggle                 |
| `app/components/Clicker/Model/Building/ListItem.vue` | summed price display            |

## Notes

- No "buy max" option — it turns the interesting spend decision into a single button; revisit only if players ask.
- Save shape unchanged (`amount` still a number), so this composes with every other proposal.
