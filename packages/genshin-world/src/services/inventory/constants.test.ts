import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { CONDENSED_RESIN_ITEM_ID, ORIGINAL_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { describe } from "vitest";

const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
// The dish a cooking instruction teaches, and the instruction itself, as the bag holds them
export const DISH_ID = 108_011;
export const INSTRUCTION_ITEM_ID = 109_101;
export const COOKING_RECIPE: CookingRecipe = {
  foodType: CookingFoodType.Heal,
  id: 1,
  ingredients: [],
  isDefaultUnlocked: false,
  maxProficiency: 2,
  nameTextId: "1",
  qteParam: [0.5, 0.4],
  rankLevel: 1,
  resultItemIds: {
    [CookingQuality.Delicious]: DISH_ID,
    [CookingQuality.Regular]: DISH_ID,
    [CookingQuality.Suspicious]: DISH_ID,
  },
  specialties: [],
  unlockItemIds: [INSTRUCTION_ITEM_ID],
};
// A forge recipe opened by its diagram, and a crafting recipe opened by its instruction, the one that crafts Condensed Resin
export const FORGE_DIAGRAM_ID = 221_010;
export const FORGE_RECIPE: ForgeRecipe = {
  forgePoint: 0,
  forgeType: 1,
  id: 13_011,
  kind: ForgeRecipeKind.Weapon,
  materials: [{ count: 50, id: 101_101 }],
  mora: 5000,
  playerLevel: 10,
  queueSize: 1,
  results: [{ count: 1, itemId: 13_011, weight: 1 }],
  seconds: 3600,
  unlockItemIds: [FORGE_DIAGRAM_ID],
};
export const CRAFTING_INSTRUCTION_ID = 221_007;
export const CRAFTING_RECIPE: CraftingRecipe = {
  combineType: 6,
  id: 22_007,
  kind: CraftingRecipeKind.CondensedResin,
  materials: [{ count: 60, id: ORIGINAL_RESIN_ITEM_ID }],
  mora: 100,
  nameTextId: "1",
  playerLevel: 10,
  resultCount: 1,
  resultItemId: CONDENSED_RESIN_ITEM_ID,
  unlockItemIds: [CRAFTING_INSTRUCTION_ID],
};
// A furnishing's blueprint, opened by its diagram
export const BLUEPRINT_DIAGRAM_ID = 380_101;
export const HOME_BLUEPRINT: HomeBlueprint = {
  id: 360_101,
  materials: [{ count: 8, id: 101_307 }],
  seconds: 50_400,
  trustExp: 60,
  unlockItemIds: [BLUEPRINT_DIAGRAM_ID],
};
// A realm with nothing learned and nothing made, its stores at the epoch
export const HOME_PROGRESS: HomeProgress = {
  claimedRewardIds: [],
  companionIds: [],
  learnedBlueprintIds: [],
  madeBlueprintIds: [],
  orders: [],
  realmBounty: 0,
  realmBountyAccruedAt: EPOCH,
  realmCurrency: 0,
  realmCurrencyAccruedAt: EPOCH,
  trustExp: 0,
};

describe.todo("constants");
