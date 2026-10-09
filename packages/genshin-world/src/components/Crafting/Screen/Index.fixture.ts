import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import englishNameText from "#src/generated/nameText/English.json";
import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { createSeededRandom } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The Tier recipe that makes a second-tier enhancement material, and Condensed Resin, which the player has learned from its
// Instruction, both open at Adventure Rank 10, with the party's Sucrose, who doubles an enhancement material's craft
const recipes: CraftingRecipe[] = [
  {
    combineType: 1,
    id: 11_001,
    kind: CraftingRecipeKind.Tier,
    materials: [{ count: 3, id: 112_002 }],
    mora: 25,
    nameTextId: "2293592500",
    playerLevel: 1,
    resultCount: 1,
    resultItemId: 112_003,
    unlockItemIds: [],
  },
  {
    combineType: 6,
    id: 22_007,
    kind: CraftingRecipeKind.CondensedResin,
    materials: [
      { count: 1, id: 100_085 },
      { count: 60, id: 106 },
    ],
    mora: 100,
    nameTextId: "3928328228",
    playerLevel: 10,
    resultCount: 1,
    resultItemId: 220_007,
    unlockItemIds: [221_007, 221_067],
  },
];
const items: InventoryItem[] = [
  { definition: getItemDefinition(112_002, englishNameText), id: 1, quantity: 9 },
  { definition: getItemDefinition(100_085, englishNameText), id: 2, quantity: 1 },
];

export const props = {
  adventureRank: 10,
  crafters: [
    { id: 10_000_043, name: "Sucrose" },
    { id: 10_000_058, name: "Yae Miko" },
  ],
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items, nextId: 3 },
  nameText: englishNameText,
  progress: { learnedRecipeIds: [22_007] },
  random: createSeededRandom(WORLD_RANDOM_SEED),
  recipes,
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 2_945_208, [Currency.OriginalResin]: 160 },
};
