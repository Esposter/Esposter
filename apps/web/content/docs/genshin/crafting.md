---
title: Crafting
description: The bench's recipes from the game's combine table — three of a material for one of the tier above, potions, baits and Condensed Resin — each opened by its rank and, where an instruction opens it, by learning it, paid from the bag and the wallet, and crafted whole or refused. The bench is not placed in the world and nothing is on a screen yet.
---

# Crafting

The bench's recipes are read from the game's combine table into the world's data, and the rules of crafting run over them: which recipes a player has open, how many of a recipe the bag and wallet pay for, a batch crafted whole or refused, and a recipe learned from its instruction. This page is the first build of the [crafting](/docs/proposals/genshin/crafting) proposal, covering the tiers, potions, baits and Condensed Resin. The bench's place in the world, its screen, the gadgets, and the characters' crafting talents are not built yet and stay in the proposal.

## How it works

```mermaid
flowchart TD
  C["The combine table: each craft's materials, Mora, rank and result"] --> K{"A bench kind?"}
  K -->|"yes"| R["Recipe written to the slice"]
  M["The material table: an instruction's use names the recipe it opens"] --> R
  R --> O{"Open: rank reached, and learned where an instruction opens it?"}
  O -->|"no"| H["Not offered"]
  O -->|"yes"| N{"The whole batch paid for, and room for every result?"}
  N -->|"no"| X["Refused, nothing spent"]
  N -->|"yes"| S["Materials, resin and Mora spent, results into the bag"]
  I["An instruction in the bag"] --> L{"Its recipe not yet learned?"}
  L -->|"yes"| LN["Instruction taken, recipe learned"]
```

## The recipes

`pnpm -C scripts genshin:assets crafting` writes the recipe slice from the game text dump's combine and material tables. The combine table is not in the community dump the scripts read, so it is fetched as the [game data formats](/docs/genshin/game-data-formats) page describes. A row is written when it is a craft at the bench and of one of these kinds:

- **Tiers**, the combine types that make three of a material for one of the next. Every tier row takes exactly three of one material for one item, and a row that does not is an error.
- **Potions**, the combine types for Heatshield and Desiccant potions and for the formulas of Pure Water and Strength Tonic.
- **Baits**, each making ten from its two ingredients.
- **Condensed Resin**, the one recipe whose result is item 220007, from one crystal core and 60 Original Resin.

Left out, each for its own reason: the convert rows, which turn a boss material into another with Dream Solvent and are not three-for-one; the homeworld's rows, which belong to the Serenitea Pot; the resonance stones and Portable Waypoint, which the statues and exploring pages will place; the gadget recipes and the essential oils, whose instructions the table does not name; and the Xiao Lantern, a quest's item.

A recipe the table shows from the start is open from the start. One it hides is written with the instruction items that open it, read off the material table's use of each instruction. A hidden recipe no instruction opens is an error, so a table change cannot hide a recipe silently.

## The rules

- **Open.** A recipe is offered once the player's Adventure Rank reaches its rank, and, for a recipe an instruction opens, once it is learned.
- **Count.** The times a recipe can be crafted is the least of what each material and the Mora pays for. Original Resin is paid from the wallet, regenerated to the moment of the craft; every other material from the bag.
- **Craft.** A batch is crafted whole or refused. Its materials, resin and Mora are spent and its results put in the bag, and a batch the bag has no stack room for every result of is refused. That is how Condensed Resin stops at the five it holds.
- **Learn.** Using an instruction takes one from the bag and records the recipe as learned. The instruction must be one the recipe names, held by the bag, and the recipe not learned already.

## Key files

| File                                                                    | Role                                                                          |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/crafting/writeCraftingRecipes.ts`   | The recipe slice written from the combine table                               |
| `scripts/src/services/genshinAssets/crafting/toCraftingRecipe.ts`       | One row as a recipe, refusing a tier that is not three of one material        |
| `scripts/src/services/genshinAssets/items/readUnlockItemIdMap.ts`       | Each recipe's instruction items, read off the material table                  |
| `packages/genshin-world/src/services/crafting/craftRecipe.ts`           | A batch crafted whole, or refused with nothing spent                          |
| `packages/genshin-world/src/services/crafting/computeCraftableCount.ts` | How many of a recipe the bag, wallet and regenerated resin pay for            |
| `packages/genshin-world/src/services/crafting/checkIsRecipeOpen.ts`     | Whether a recipe is open at a rank, and learned where an instruction opens it |
| `packages/genshin-world/src/services/crafting/learnCraftingRecipe.ts`   | A recipe learned from an instruction in the bag                               |
| `packages/genshin-world/src/services/crafting/readCraftingRecipes.ts`   | The slice imported on demand and checked against its shape                    |
| `packages/genshin-world/src/generated/crafting/recipes.json`            | The bench's recipes, a few hundred of them                                    |

## Notes

- **Each recipe carries its result's name.** A recipe's `nameTextId` is the text id of the item it makes, read from the material table, and `genshin:text names` writes it into the world's names chunk per language, so a bench screen can show it without a game text key.
- **The bench is not placed.** The official map marks no crafting bench, and the scene's streaming records, which place one in a city, are not read yet, so no bench stands in the world and no prompt offers a craft.
- **The gadget recipes are unsourced.** The table holds the gadgets' recipes hidden with no instruction to open them. The wiki was not reachable from this build to name the source, so they are left out until one does.
- **Nothing is on a screen.** The recipes and their rules are data and services. The bench's screen is not built, as with the [shops](/docs/genshin/shops) and [expeditions](/docs/genshin/expeditions).

## Sources

- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `CombineExcelConfigData`, each craft's materials, Mora, rank and result, and `MaterialExcelConfigData`, whose instructions' uses name the recipes they open.
- [Condensed Resin](https://genshin-impact.fandom.com/wiki/Condensed_Resin), Genshin Impact Wiki: the 60 resin a craft takes and the five a player can hold, the figures the proposal settles its decisions from.
