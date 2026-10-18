import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { checkIsInventoryItemUsable } from "#src/services/inventory/checkIsInventoryItemUsable";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(checkIsInventoryItemUsable, () => {
  const INSTRUCTION_ITEM_ID = 109_101;
  const DISH_ID = 108_011;
  const instruction: InventoryItem = {
    definition: {
      category: ItemCategory.Material,
      id: INSTRUCTION_ITEM_ID,
      name: "",
      rank: 0,
      rarity: 0,
      stackLimit: 99,
    },
    id: 1,
    quantity: 1,
  };
  const recipe: CookingRecipe = {
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
  const instructionRecipeMap = new Map([[INSTRUCTION_ITEM_ID, recipe]]);

  test("an instruction item is usable until its dish is learned", () => {
    expect.hasAssertions();
    const options = { dishUseMap: new Map(), instructionRecipeMap };

    expect(
      checkIsInventoryItemUsable(instruction, {
        ...options,
        cookingProgress: { learnedRecipeIds: [], proficiencies: {} },
      }),
    ).toBe(true);
    expect(
      checkIsInventoryItemUsable(instruction, {
        ...options,
        cookingProgress: { learnedRecipeIds: [recipe.id], proficiencies: {} },
      }),
    ).toBe(false);
  });
});
