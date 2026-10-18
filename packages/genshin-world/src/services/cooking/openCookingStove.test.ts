import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { openCookingStove } from "#src/services/cooking/openCookingStove";
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

describe(openCookingStove, () => {
  test("a city stove cooks where a campfire would be out", () => {
    expect.hasAssertions();

    const locked = createRecipe(1, false);
    const open = createRecipe(2, true);

    expect(openCookingStove([locked, open])).toBe(open);
  });
});
