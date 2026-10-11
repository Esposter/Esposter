---
title: Inventory
description: Proposal — what the bag still lacks: using food on its own target, with the party's health.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/components/Inventory/**"]
waiting: "the heal each food gives, read from the material table by the cooking proposal (cooking.md, Food's effects act through the kits)"
---

# Inventory

The [inventory](/docs/genshin/inventory) page holds the bag, its wallet, screen and destroy mode. What is left is using a food.

## Decisions

- **Food heals its own target.** Using a food takes one from the bag and applies its own effect to the target it names, the selected character for most recovery dishes and the whole party for some, never past full health. It waits on each food's heal and target, which are the game's own figures and not yet read into the bag's data.

## Scope and order

**This adds:**

1. **Using food**, on each food's own target, with the party's health.

## What this does not propose

- **Topping up.** No payment of any kind.
- **The screen's look.** Its sizes, colours and the tabs' and items' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                               | Role after the change                         |
| :----------------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-world/src/components/Inventory/Screen/Index.vue` | Gains using a food                            |
| `packages/genshin-world/src/services/party/`                       | The party's health, which using a food raises |

## Sources

- [Inventory](https://genshin-impact.fandom.com/wiki/Inventory), Genshin Impact Wiki: what each tab can use or destroy.
