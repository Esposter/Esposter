import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { checkCanAutoCook } from "#src/services/cooking/checkCanAutoCook";
import { describe, expect, test } from "vitest";

const MAX_PROFICIENCY = 2;
const recipe: CookingRecipe = {
  foodType: CookingFoodType.Heal,
  id: 1,
  ingredients: [],
  isDefaultUnlocked: true,
  maxProficiency: MAX_PROFICIENCY,
  nameTextId: "1",
  qteParam: [0.5, 0.4],
  rankLevel: 1,
  resultItemIds: {
    [CookingQuality.Delicious]: 108_013,
    [CookingQuality.Regular]: 108_012,
    [CookingQuality.Suspicious]: 108_011,
  },
  specialties: [],
  unlockItemIds: [],
};
const AVATAR_ID = 1;

describe(checkCanAutoCook, () => {
  test("auto cook is offered at full proficiency", () => {
    expect.hasAssertions();

    expect(
      checkCanAutoCook(recipe, { learnedRecipeIds: [], proficiencies: { [recipe.id]: MAX_PROFICIENCY } }, AVATAR_ID),
    ).toBe(true);
  });

  test("auto cook is not offered before full proficiency", () => {
    expect.hasAssertions();

    expect(
      checkCanAutoCook(
        recipe,
        { learnedRecipeIds: [], proficiencies: { [recipe.id]: MAX_PROFICIENCY - 1 } },
        AVATAR_ID,
      ),
    ).toBe(false);
  });
});
