---
title: Inventory
description: Proposal — what the bag still lacks: the items themselves, defined as the pages that place them in the world bring them, using and destroying them, the full-bag hint, Fates bought with earned Primogems, and the screen's look measured off the game.
model: claude-opus-5-5
---

# Inventory

This page builds on the [inventory](/docs/genshin/inventory), whose bag, wallet and screen are built. The game's bag does more than hold: it uses food on the party, destroys what a player no longer wants, and says when it is full. What is left here is that, and the items to fill it.

## Decisions

- **Items come with the pages that place them.** An `ItemDefinition` (its id, tab, name, rarity, stack limit and rank) is read from the game's material table by the page that first drops or awards the item, its name from the game's text by its own text id, never typed by hand.
- **The materials table is written by a reader.** `pnpm -C scripts genshin:assets items` reads the dump's `MaterialExcelConfigData.json` for every item id `EnemyDropFamilyDropTableMap` names and writes `packages/genshin-world/src/data/items/materials.json`: each item's id, its material type spelt as the table spells it, its name's text id, its rank, its rarity (the table's `rankLevel`) and its stack limit. The reader fails for a name no `GameTextKey` holds, so every row's name is in the game text, and a new drop's item is a run of the reader, a line in `GameTextKey` and a run of `genshin:text write`. The hilichurls' Damaged, Stained and Ominous Masks are the first three.
- **A material's tab is its type's.** `MaterialTypeItemCategoryMap` files each type the world names in its tab as the wiki's item pages do: the masks' type, `MATERIAL_AVATAR_MATERIAL`, among the Character Development Items. `getItemDefinition` builds the bag's definition from a row, its name in the reader's language.
- **The full-bag hint is the game's.** A pick up with something left over shows the game's own hint, "No space left in Inventory. Please free up some space and try again.", over the world, as the game does.
- **Fates are bought with Primogems, never money.** Short of a wish's Fates, the wish screen offers the game's own purchase: either Fate for 160 Primogems. Genesis Crystals are never sold, so the offer to convert them never shows.
- **Using and destroying.** Food heals the party's members and the game's destroy picks the one-star to four-star items it allows; both wait on the party's health and an artifact's level.

## Scope and order

**Today:** the bag, its room and sort, the wallet and the screen on B are built; the world gives the player nothing yet.

**This adds, in order:**

1. **The full-bag hint**, with the first page that drops items.
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
- [Damaged Mask](https://genshin-impact.fandom.com/wiki/Damaged_Mask), Genshin Impact Wiki: the hilichurls' masks filed among the Character Development Items.
- [AnimeGameData](https://gitlab.com/Dimbreath/AnimeGameData), the community's dump of the game's data: `MaterialExcelConfigData`, each material's type, name, rank, rarity and stack limit.
