---
title: Inventory
description: Proposal — what the bag still lacks: using food on its own target and destroying equipment from the bag's screen, with the party's health and the game's destroy mode.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/components/Inventory/**"]
---

# Inventory

This page builds on the [inventory](/docs/genshin/inventory), whose bag, wallet, screen and the materials the enemies drop are built, and on which the full-bag hint, the Fates bought with Primogems and the destroy rule are built as well. What is left is using an item and the bag's destroy mode.

## Decisions

- **Food heals its own target.** Using a food takes one from the bag and applies its own effect to the target it names, the selected character for most recovery dishes and the whole party for some, never past full health. It waits on each food's heal and target, which are the game's own figures and not yet read into the bag's data.
- **Destroying from the screen.** The bag's destroy mode picks one entry at a time, and the destroy rule it uses is the [inventory](/docs/genshin/inventory) page's.

## Scope and order

**Today:** the bag, its room and sort, the wallet, the screen on B, the materials the enemies drop, the full-bag hint on a pick up, the Fates bought with Primogems on the wish screen, and the destroy rule are built.

**This adds, in order:**

1. **Using food**, on each food's own target, with the party's health.
2. **The destroy mode** on the bag's screen, with the rule the bag already holds.

## What this does not propose

- **Topping up.** No payment of any kind.
- **The screen's look.** Its sizes, colours and the tabs' and items' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                               | Role after the change                         |
| :----------------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-world/src/components/Inventory/Screen/Index.vue` | Gains using a food and the destroy mode       |
| `packages/genshin-world/src/services/party/`                       | The party's health, which using a food raises |

## Sources

- [Inventory](https://genshin-impact.fandom.com/wiki/Inventory), Genshin Impact Wiki: what each tab can use or destroy.
