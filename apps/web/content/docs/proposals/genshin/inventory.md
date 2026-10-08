---
title: Inventory
description: Proposal — what the bag still lacks: the full-bag hint, Fates bought with earned Primogems, using and destroying items, and the screen's look measured off the game.
model: claude-opus-5-5
---

# Inventory

This page builds on the [inventory](/docs/genshin/inventory), whose bag, wallet, screen and the materials the enemies drop are built. The game's bag does more than hold: it uses food on the party, destroys what a player no longer wants, and says when it is full. What is left here is that.

## Decisions

- **The full-bag hint is the game's.** A pick up with something left over shows the game's own hint, "No space left in Inventory. Please free up some space and try again.", over the world, as the game does.
- **Fates are bought with Primogems, never money.** Short of a wish's Fates, the wish screen offers the game's own purchase: either Fate for 160 Primogems. Genesis Crystals are never sold, so the offer to convert them never shows.
- **Using and destroying.** Food heals the party's members and the game's destroy picks the one-star to four-star items it allows; both wait on the party's health and an artifact's level.

## Scope and order

**Today:** the bag, its room and sort, the wallet, the screen on B, and the materials the enemies drop, defined from the game's table and picked up into the bag, are built. The enemies' drops are the only items the world gives yet.

**This adds, in order:**

1. **The full-bag hint**, shown on a pick up the bag cannot take.
2. **Fates bought with Primogems**, on the wish screen.
3. **Using and destroying**, with the party's health.

## What this does not propose

- **Topping up.** No payment of any kind.
- **The screen's look.** Its sizes, colours and the tabs' and items' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                               | Role after the change                            |
| :----------------------------------------------------------------- | :----------------------------------------------- |
| `packages/genshin-world/src/components/Inventory/Screen/Index.vue` | Gains using and destroying an item               |
| `packages/genshin-world/src/components/Wish/Screen/Index.vue`      | Offers Fates for Primogems when short of them    |
| `packages/genshin-text/src/models/GameTextKey.ts`                  | Gains the full-bag hint and the purchase's words |

## Sources

- [Inventory](https://genshin-impact.fandom.com/wiki/Inventory), Genshin Impact Wiki: the full-bag hint, and what each tab can use or destroy.
- [Primogem](https://genshin-impact.fandom.com/wiki/Primogem), Genshin Impact Wiki: either Fate for 160 Primogems.
