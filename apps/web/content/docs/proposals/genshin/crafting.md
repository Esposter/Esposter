---
title: Crafting
description: Proposal — the crafting bench's place in the city, the one part left. The recipes, their rules, the instruction unlocks, the gadgets, the characters' crafting talents with their regional materials, the screen with its tabs and the save's crafting slice are built, as the crafting page records.
model: claude-haiku-5-5
needs: [game-exports]
waiting: "the scene group export (the other machine), which the official map does not mark a bench in"
touches:
  [
    "packages/genshin-world/src/services/crafting/**",
    "packages/genshin-world/src/models/crafting/**",
    "scripts/src/services/genshinAssets/crafting/**",
  ]
---

# Crafting

The crafting bench, which the game calls alchemy, turns materials into better ones: three of a tier into one of the next, potions and baits from ingredients, gadgets from their instructions, and Condensed Resin from Original Resin. Most of what levels a character, a talent or a weapon passes through it at some tier. Its recipes, their rules, the instructions that open them and the save's crafting slice are [built](/docs/genshin/crafting). What is left is the bench's place in the world. It spends from the [inventory](/docs/genshin/inventory)'s bag and wallet, and takes Condensed Resin's resin from the [Original Resin](/docs/genshin/original-resin) wallet.

## Decisions

- **Every recipe is the game's own.** `CombineExcelConfigData` holds each one: its materials, its Mora (`scoinCost`), its result and how many, the Adventure Rank it needs (`playerLevel`), and its kind. Nothing about a recipe is typed by hand. The kinds the bench crafts are the tiers, potions, baits, Condensed Resin and gadgets, as the [crafting](/docs/genshin/crafting) page lists them.
- **Three make one of the tier above.** Ascension and talent materials are crafted from three of the same material a tier below, as the recipes hold them. A tier row that does not take exactly three of one material is an error, not a recipe.
- **Recipes are learned, where the table hides them.** The [crafting page](/docs/genshin/crafting) settles how each recipe opens. This covers the baits, Condensed Resin, and the Pure Water and Strength Tonic formulas. It supersedes the earlier wording that every potion waits on its instructions, because the table shows the Heatshield and Desiccant potions from the start, with no instruction to open them. Revised 2026-10-08 by the build that wrote the [crafting](/docs/genshin/crafting) page.
- **Condensed Resin** is crafted from 60 Original Resin, and one crystal core, as the [crafting page](/docs/genshin/crafting) counts them. Five are held at most, which is the item's own stack limit in the bag, as [Original Resin](/docs/proposals/genshin/original-resin) decides.
- **A character's crafting talent.** The wiki's Crafting Talents category holds thirteen talents, one per character, read from each talent page's infobox. Each is one of four effects, applied to the crafter's craft through the world's seeded random source: a double product at 10% (Eula, Sucrose, Layla, Albedo, Ayaka, Alhaitham, Wriothesley, on their kind of recipe), a refund of one material at 25% (Xingqiu, Mona, Dori), a refund of one material at 20% for potions (Lisa), or one extra regional talent material at 25% for a talent book (Yae Miko) or 10% (Prune). The effects are settled.
- **A crafting talent is keyed by its character's avatar id, with no proud skill join.** Each talent is one character's utility passive, unlocked from the start, so the character alone says whether it applies. The wiki's talent pages (read through the persona's reader, `Category:Crafting Talents`) and the `stats/characters` record give each: double at 10% on Character Talent Materials for Eula 10000051 and Layla 10000074; on Weapon Ascension Materials for Albedo 10000038, Ayaka 10000002, Alhaitham 10000078 and Wriothesley 10000086; on Character and Weapon Enhancement Materials for Sucrose 10000043; a refund at 25% on Character Talent Materials for Xingqiu 10000025, on Weapon Ascension Materials for Mona 10000041 and on Character and Weapon Enhancement Materials for Dori 10000068; a refund at 20% on potions for Lisa 10000006; and one regional Character Talent Material of the base material's rarity at 25% for Yae Miko 10000058 and 10% for Prune 10000132.
- **A recipe's tab is the combine table's `combineType`.** 1 is Character and Weapon Enhancement Materials (the common drops' tiers, `112xxx`), 2 Weapon Ascension Materials (`114xxx`), 3 Character Talent Materials (`1043xx`), 5 Character Ascension Materials, 4 and 12 potions and 10 baits, so a talent names the combine types it applies to and `CraftingRecipeKind` stays as built.
- **The regional extra is the same tier of another series in the book's region.** A talent book's craft adds one book of the same tier as its first material (a Teachings for a Guide, a Guide for a Philosophies), from one of the region's other two series, picked by the seeded random source. The bonus names no tier of its own, so the first material's tier is read as "the base material's rarity". The series are the wiki's Character Talent Material page's grouping, and their chains are the recipe table's: Mondstadt, Liyue, Inazuma, Sumeru, Fontaine, Natlan and Nod-Krai. Snezhnaya's books take no craft at the bench, so none of them is an extra.
- **A talent's bonus is drawn per craft.** Each of a count's crafts draws once from the world's seeded random source: a double adds one more result, and a refund gives back one of the recipe's first listed material. The crafter is chosen as the cook is, by the avatar id passed to the craft; a character with no talent crafts plainly.
- **Crafted many at once.** A recipe is crafted as many times as the bag and wallet can pay for, checked whole before anything is spent, and refused whole where the bag has no room for every result. This is built.
- **The bench is where the game puts one.** Each crafting bench stands where the city's streaming records place it, or where the [spawned places](/docs/proposals/genshin/spawned-places) fit it if they do not, and is used through the [interaction](/docs/proposals/genshin/interaction) prompts. The official map marks no crafting bench, so the spawned places cannot place one; the streaming records must, which the scene's extraction reads and which is not read yet.
- **The save holds the crafting as one slice.** `crafting` in `GenshinSave` holds the learned recipes, unique by id, and each recipe's crafted count by its id. The counts only grow, so a guest's merge keeps the larger count and unions the learned recipes, as the other grow-only slices do. The world owns both in `useWorldSave`, so a grant saves a change to either.
- **Left to other pages.** The [crafting page](/docs/genshin/crafting) lists what it leaves out. The essential oils and the Xiao Lantern are quest items for the [quests](/docs/proposals/genshin/quests) page to settle.
- **The screen's words are the game's own.** The title and the Craft button read the reconfirm page's title, the Crafting Performed line `UI_SYNTHESIS_PAGE_ITEM_COUNT`, the Crafting Materials heading `UI_SYNTHESIS_PAGE_FOOD_ITEM_TITLE`, the Required line `UI_COMMON_ITEM_NEED`, and the amount slider's name the cooking page's Quantity, as `GameTextKey` records them. Each recipe's name is the names chunk's entry for its `nameTextId`.
- **The recipe tabs are the combine types the open recipes fall under.** One tab per combine type, in ascending combine type order, named by the game's own text key for it, `COMBINE_TYPE_NAME1` to `COMBINE_TYPE_NAME12`. The labels of 6 and 12 are in the medium English text map, `Consumable` and `Food`, so every combine type a recipe carries has its key; the first tab shows until one is picked. The fixture's earlier note called the Condensed Resin's tab the Gadget tab, which the game's own label for combine type 6 does not match, so the note now says Consumable. A check of the clip by eye is the one thing left to settle.
- **The bench's crafter is picked on the screen.** The party's characters are listed and one is picked to cook the batch; with none picked the batch crafts plainly.
- **The gadgets are the combine type 6 rows beside Condensed Resin.** Seven recipes: the Portable Waypoint and the six Resonance Stones, each made from its materials and Mora, with a kind of its own, `CraftingRecipeKind.Gadget`. Each is opened by its instruction item, as the [crafting page](/docs/genshin/crafting) records, through its `ITEM_USE_UNLOCK_COMBINE` use, so the instructions are read from the dump, not the wiki. Where a player gets an instruction is not settled here; a gadget's recipe is offered only once its instruction is learned, as every hidden recipe is.

## How it works

```mermaid
flowchart TD
  BENCH["F at a crafting bench"] --> RECIPE{"Recipe open: rank reached, and learned where an instruction opens it?"}
  RECIPE -->|"no"| HIDDEN["Not offered"]
  RECIPE -->|"yes"| COUNT["A count chosen"]
  COUNT --> PAY{"Materials, resin and Mora for all of them, and room for every result?"}
  PAY -->|"no"| REFUSE["Refused, nothing spent"]
  PAY -->|"yes"| MAKE["Spent and made"]
  MAKE --> BONUS{"The crafting character's talent applies?"}
  BONUS -->|"yes"| EXTRA["A double at 10%, a refund at 25%, or at 20% on potions, or an extra regional talent material at 25% or 10%"]
  BONUS -->|"no"| DONE["Into the bag"]
  EXTRA --> DONE
```

## Scope and order

**Built:** the recipes of the tiers, potions, baits, Condensed Resin and the gadgets, their rules, the instructions that open them, the characters' crafting talents' doubles, refunds and regional materials, the bench's screen with its recipe tabs through its fixture, as the [crafting](/docs/genshin/crafting) page records.

**Still to build, in order:**

1. **The bench's place.** Waits on the other machine's scene group export, since the official map marks no bench and the wiki places Mondstadt's in the Market District. Its prompt then goes through the interaction page. The screen's learned recipes and crafted counts are already the world's, held in `useWorldSave`, so the bench binds them with its `craftedCountMap` model and its `progress` prop.

## Data and measures

- **Read from the wiki:** the crafting talents and the regions' talent book series (built into the Decisions above).
- **Not measured.** Crafting takes no time in the game and has no timed state, so no compute-queue item is owed.

## Key files

| File                                                              | Role after the change                                |
| :---------------------------------------------------------------- | :--------------------------------------------------- |
| `scripts/src/services/genshinAssets/world/readWorldPlacements.ts` | Reads the bench's streaming placements for Mondstadt |

## Sources

- [Crafting](https://genshin-impact.fandom.com/wiki/Crafting), Genshin Impact Wiki: the bench and what it crafts, three of a tier for one of the next, gadgets from their instructions, and the characters' refund and double talents.
- [Condensed Resin](https://genshin-impact.fandom.com/wiki/Condensed_Resin), Genshin Impact Wiki: crafted from 60 resin, its recipe from Liyue's Reputation or the blacksmith.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the combine table with each recipe's materials, Mora, result and rank, and the material table whose instructions name the recipes they open.
