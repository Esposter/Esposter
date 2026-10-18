import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { listOpenCookingRecipes } from "#src/services/cooking/listOpenCookingRecipes";
import { describe, expect, test } from "vitest";

const createRecipe = (id: number, isDefaultUnlocked: boolean): CookingRecipe => ({
  foodType: CookingFoodType.Heal,
  id,
  ingredients: [],
  isDefaultUnlocked,
  maxProficiency: 2,
  nameTextId: String(id),
  qteParam: [0.5, 0.4],
  rankLevel: 1,
  resultItemIds: {
    [CookingQuality.Delicious]: 108_013,
    [CookingQuality.Regular]: 108_012,
    [CookingQuality.Suspicious]: 108_011,
  },
  specialties: [],
  unlockItemIds: [],
});

describe(listOpenCookingRecipes, () => {
  test("the stove lists the dishes known from the start and the learned ones", () => {
    expect.hasAssertions();
    const knownFromStart = createRecipe(1, true);
    const learned = createRecipe(2, false);
    const unknown = createRecipe(3, false);

    expect(
      listOpenCookingRecipes([knownFromStart, learned, unknown], { learnedRecipeIds: [2], proficiencies: {} }),
    ).toStrictEqual([knownFromStart, learned]);
  });
});
