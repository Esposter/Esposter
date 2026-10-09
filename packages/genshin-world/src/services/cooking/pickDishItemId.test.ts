import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { pickDishItemId } from "#src/services/cooking/pickDishItemId";
import { describe, expect, test } from "vitest";

describe(pickDishItemId, () => {
  const AVATAR_ID = 10_001;
  const OTHER_AVATAR_ID = 10_002;
  const SPECIAL_ITEM_ID = 108_014;
  const RESULT_ITEM_ID = 108_013;
  const recipe: CookingRecipe = {
    id: 1001,
    ingredients: [{ count: 1, id: 100_011 }],
    isDefaultUnlocked: true,
    maxProficiency: 5,
    qteParam: [0.5, 0.4],
    rankLevel: 1,
    resultItemIds: {
      [CookingQuality.Delicious]: RESULT_ITEM_ID,
      [CookingQuality.Regular]: 108_012,
      [CookingQuality.Suspicious]: 108_011,
    },
    specialties: [
      {
        avatarId: AVATAR_ID,
        chances: { [CookingQuality.Delicious]: 20, [CookingQuality.Regular]: 15, [CookingQuality.Suspicious]: 10 },
        itemId: SPECIAL_ITEM_ID,
      },
    ],
    unlockItemIds: [],
  };

  test("should make the special dish when the roll falls under the character's chance for the quality", () => {
    expect.hasAssertions();

    expect(pickDishItemId(recipe, CookingQuality.Delicious, AVATAR_ID, 0.19)).toBe(SPECIAL_ITEM_ID);
  });

  test("should make the quality's own result when the roll reaches the chance", () => {
    expect.hasAssertions();

    expect(pickDishItemId(recipe, CookingQuality.Delicious, AVATAR_ID, 0.2)).toBe(RESULT_ITEM_ID);
  });

  test("should make the quality's own result for a character with no special dish here", () => {
    expect.hasAssertions();

    expect(pickDishItemId(recipe, CookingQuality.Delicious, OTHER_AVATAR_ID, 0)).toBe(RESULT_ITEM_ID);
  });
});
