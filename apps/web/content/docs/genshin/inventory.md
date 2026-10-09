---
title: Inventory
description: The game's bag and its currencies as pure state. Nine tabs in the game's order, items stacking to their own limits, weapons and artifacts one each, the bag's room per tab and by kind, each tab sorted as the game sorts it, and a wallet of Mora, Primogems, Genesis Crystals, the two Fates, Starglitter, Stardust, the Masterless Stella Fortuna and Original Resin, which regenerates. The materials the enemies drop are defined from the game's material table and taken into the bag on a pick up. Its screen opens on B, its words the game's own. Nothing is bought with money.
---

# Inventory

The game keeps everything the player carries in one bag of nine tabs, opened with B, and keeps its currencies beside it. The world package holds the bag as pure state and functions over it, `genshin-interface` draws its screen, and the world's `Inventory/Screen` puts the two together in the reader's language.

## How it works

```mermaid
flowchart TD
  P["A pick up, a chest, a wish's weapon"] --> A{"Weapon or artifact?"}
  A -->|"yes"| ROOM{"Room left in that tab?"}
  ROOM -->|"yes"| ONE["An entry of its own at its starting level"]
  ROOM -->|"no"| LEFT["Left over"]
  A -->|"no"| STACK{"A stack of it already?"}
  STACK -->|"yes"| FILL["The stack fills to its item's limit"]
  STACK -->|"no"| KINDS{"Fewer kinds than the bag holds?"}
  KINDS -->|"yes"| NEW["A new stack"]
  KINDS -->|"no"| LEFT
  FILL --> REST["Whatever does not fit is left over"]
  NEW --> REST
  B["B, or the Paimon menu"] --> SCREEN["Inventory screen: the open tab sorted, its room, Mora"]
```

- **The game's nine tabs.** `ItemCategory` is Weapons, Artifacts, Character Development Items, Food, Materials, Gadget, Quest, Precious Items and Furnishings, and `ItemCategories` lists them in the game's order. Each tab's name is the game's own text (`ITEM_WEAPON` to `ITEM_FURNITURE`, through `ItemCategoryGameTextKeyMap`).
- **An item is its definition.** `ItemDefinition` carries the game's item id, its tab, its name in the reader's language, its rarity, its stack limit and its rank, the place the game gives it in its tab's own order. The bag holds `InventoryItem` entries, each numbered by the bag's own count of what it has taken in, so an entry's id never repeats and runs in the order obtained.
- **The world's materials are read from the game's table.** `pnpm -C scripts genshin:assets items` reads the material table of the game's dump for every item the drop families name, and writes `packages/genshin-world/src/data/items/materials.json`: each item's id, its material type as the table spells it, the text id of its name, its rank, its rarity and its stack limit. The reader fails for a name no `GameTextKey` holds, so every item's name is the game's own text. `getItemDefinition` builds the definition from a row, its name read from the game text in the reader's language, and `MaterialTypeItemCategoryMap` files the material's type in its tab, the character development items for the enemies' masks.
- **Stacks fill to their item's own limit.** `addInventoryItem` adds to an item's stack up to its `stackLimit`, or opens a new stack. The limit is the item's own: most stop at 9,999, ores and experience materials hold 99,999, food and the common bosses' drops 2,000, consumable gadgets 99, and reusable gadgets and most quest items one, as the wiki lists them.
- **Weapons and artifacts never stack.** Each is an entry of its own with its level, a weapon from 1 and an artifact from 0.
- **Taking items takes from the stacks.** `takeInventoryItems` takes a count of one item out of its stacks, from the first stack it lies in onwards, and a stack emptied is dropped. A take the bag cannot cover is refused.
- **The bag's room is the game's.** `ItemCategoryRoomMap` gives the tabs counted on their own their room in pieces: 2,000 weapons, 2,400 artifacts and 2,600 furnishings. Every other tab shares `INVENTORY_KIND_LIMIT`, 2,300 kinds of item counted by kind rather than quantity.
- **What does not fit is left over.** An addition returns the bag after it and how many there was no room for, which stay where they lay, as the game leaves a pick up the bag cannot take.
- **Each tab sorts as the game's does.** `computeInventoryTab` takes a tab's entries in the game's order. Weapons and artifacts sort by Level or Quality, ascending or descending (`InventorySortOrder`), the other key breaking a tie the same way. Furnishings run from the first obtained, gadgets and quest items from the highest quality down, and every other tab in the game's own order by rank. A tie left falls to rank, then to the order obtained.
- **A wallet of the game's currencies.** `Wallet` counts each `Currency`: Mora, Primogems and Genesis Crystals, which the game holds outside the tabs, and Intertwined Fate, Acquaint Fate, Masterless Starglitter, Masterless Stardust and Masterless Stella Fortuna, which it files among the Precious Items. Each is named by its item's own text (`CurrencyGameTextKeyMap`). Original Resin is counted in the same wallet, beside the moment it last changed, from which it regenerates ([original resin](/docs/genshin/original-resin)).
- **Nothing is bought with money.** Genesis Crystals are the game's paid currency, bought only by topping up. Nothing here takes a payment, so the wallet's Genesis Crystals stay at none and every Primogem and Fate is one the world gives.
- **The screen opens on B.** `InputAction.OpenInventory` is on B, and the screens' map opens `ScreenKind.Inventory` from it or from the Paimon menu. `Inventory/Screen` opens on the weapons, sorted by level from the highest, and hands `InventoryScreen` the tabs, the open tab's cells, its room in the game's own wording ("Weapons 0/2000", only on a tab counted on its own), the sort with its order's word for a screen reader, and the Mora count beside the tabs. A weapon's caption is its level as the game writes one, an artifact's its plus, and a stack's its count. Precious Items shows the wish's five currencies the wallet holds, in the game's order, ahead of the bag's own precious items.

## Key files

| File                                                                           | Role                                                                                                           |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | A pick up taken into the bag: stacks, single pieces, room and what is left                                     |
| `packages/genshin-world/src/services/inventory/takeInventoryItems.ts`          | The items taken out of the bag's stacks, from the first stack onwards                                          |
| `packages/genshin-world/src/services/inventory/computeInventoryTab.ts`         | A tab's entries in the order the game shows them                                                               |
| `packages/genshin-world/src/services/inventory/ItemCategoryRoomMap.ts`         | The room of the tabs counted on their own                                                                      |
| `packages/genshin-world/src/services/inventory/constants.ts`                   | The bag's kinds, the starting levels, the currencies shown, an empty bag and a wallet with Original Resin full |
| `packages/genshin-world/src/services/inventory/getItemDefinition.ts`           | An item's definition, read from the materials table in the reader's language                                   |
| `packages/genshin-world/src/services/inventory/MaterialTypeItemCategoryMap.ts` | The tab each material type is filed in                                                                         |
| `packages/genshin-world/src/models/inventory/MaterialData.ts`                  | A row of the materials table, checked against its schema as the world loads                                    |
| `packages/genshin-world/src/data/items/materials.json`                         | The materials the enemies' drops name, as `genshin:assets items` writes them                                   |
| `scripts/src/services/genshinAssets/items/writeItems.ts`                       | The reader that writes the materials table from the game's dump                                                |
| `packages/genshin-world/src/models/inventory/Currency.ts`                      | The currencies the wallet counts, Original Resin among them                                                    |
| `packages/genshin-world/src/components/Inventory/Screen/Index.vue`             | The bag's screen in the reader's language                                                                      |
| `packages/genshin-world/src/components/Inventory/Screen/Index.fixture.ts`      | The weapons tab of 1,347 entries, the parity page's and the visual suite's state                               |
| `packages/genshin-interface/src/components/InventoryScreen/Index.vue`          | The bag's tabs, room, sort, grid and counts                                                                    |
| `packages/genshin-interface/src/models/ItemCategory.ts`                        | The nine tabs, in the game's order                                                                             |

## Notes

- **The weapons tab is the first state matched.** Its reference is a frame of a public account tour's recording of the English PC client at 1080 high, 30 seconds into its clip, drawn behind the screen (`inventory-weapons` in `ParityReferenceMap`). Its mean difference is 9.13% (FLIP 0.3076), from 9.14% (FLIP 0.3080) before the dropdown: what is left is the grid's item art, which the rules keep out, the tabs' icons and the detail panel's stats, none built yet.
- **The food tab's foot is scored apart.** Its reference is the same recording 58 seconds in, the Food tab's foot with the Primogems and Mora (`inventory-food`), drawn behind the screen over its foot. The mean difference is 2.26% (FLIP 0.0810, from 2.41% and 0.0774 with the figures at 22 units): the pills' ends, the top-up plus and the Mora coin sit where the frame puts them, and the figures are the game's 30-unit cap height, a size 29 and a letter-spaced 30 both scoring worse. What is left is the provisional discs standing for the Primogem and Mora marks, and the backdrop's own figures showing through the translucent pills, a double print the backdrop cannot avoid.
- **What the backdrop cannot score.** A reference drawn behind the screen shows the game's own tab icons, arrows and Details button through every area the screen leaves transparent, so a piece this screen drops there scores as if drawn. Those pieces are the nine tabs' icons, the arrows, the Details button and the stats block of the detail panel, none built yet. The remaining difference is the grid's item art, which the rules keep out, and the stats the model does not hold.
- **The sort is the game's dropdown, and the foot shows the currencies on the other tabs.** On an equipment tab (weapons, artifacts) the foot holds the trash, the filter, the sort's dropdown "Quality" and the order toggle, as the game lays them. On every other tab it holds the Primogems with their top-up plus and the Mora, in the game's order, where the dropdown stands. The dropdown is the browser's own list until its open motion is recorded (`bag-sort-open.png`, on the roadmap's Recordings owed list).
- **Not built yet.** The nine tabs' icons, the grid's item icons and stars, the trash, filter, order and currency marks (provisional discs until the glyph pass traces them from the game's icons), the detail panel's stats, its footer line, the Details button and its arrows, and the screen's animations, which wait on the recordings listed in the roadmap. The UID is the player's own data, so it is not drawn.
- **The wish's currencies are counted, not stacked.** The game files the Fates and the Masterless Starglitter, Stardust and Stella Fortuna as Precious Items with a stack of their own, so each takes one of the bag's kinds; the wallet counts them apart, and the bag's kinds leave them out.

## Sources

- [Inventory](https://genshin-impact.fandom.com/wiki/Inventory), Genshin Impact Wiki: the nine categories and what each holds, the stack limits, the 2,300 kinds, the weapons', artifacts' and furnishings' room, each tab's order, and the full-bag hint.
- [Genesis Crystal](https://genshin-impact.fandom.com/wiki/Genesis_Crystal), Genshin Impact Wiki: the paid currency, bought only by topping up.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the inventory on B.
- [Damaged Mask](https://genshin-impact.fandom.com/wiki/Damaged_Mask), Genshin Impact Wiki: the hilichurls' masks, filed among the Character Development Items.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's dump of the game's data: `MaterialExcelConfigData`, each material's type, name, rank, rarity and stack limit.
