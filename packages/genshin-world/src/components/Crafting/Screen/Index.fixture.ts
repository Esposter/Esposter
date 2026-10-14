import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { createSeededRandom } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

const [englishNameText, materialDataMap] = await Promise.all([
  NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL),
  readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
]);

// Condensed Resin on the Consumable tab, which the player has learned from its Instruction and which is open at Adventure
// Rank 10, with Diluc as the crafter and one already crafted, as the Crafting Table clip shows it
const recipes: CraftingRecipe[] = [
  {
    combineType: 6,
    id: 22_007,
    kind: CraftingRecipeKind.CondensedResin,
    materials: [
      { count: 1, id: 100_085 },
      { count: 40, id: 106 },
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
  { definition: getItemDefinition(112_002, englishNameText, materialDataMap), id: 1, quantity: 9 },
  { definition: getItemDefinition(100_085, englishNameText, materialDataMap), id: 2, quantity: 87 },
];

export const props = {
  adventureRank: 10,
  craftedCountMap: new Map<number, number>([[22_007, 1]]),
  crafters: [{ id: DILUC_CHARACTER_ID, name: "Diluc" }],
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items, nextId: 3 },
  materialDataMap,
  nameText: englishNameText,
  progress: { learnedRecipeIds: [22_007] },
  random: createSeededRandom(WORLD_RANDOM_SEED),
  recipes,
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 2_945_208, [Currency.OriginalResin]: 160 },
};
