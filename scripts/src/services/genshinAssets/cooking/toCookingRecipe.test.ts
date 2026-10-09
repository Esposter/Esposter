import type { CookBonusRow } from "#src/models/genshinAssets/cooking/CookBonusRow";
import type { CookRecipeRow } from "#src/models/genshinAssets/cooking/CookRecipeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { COOK_BONUS_REPLACE_TYPE } from "#src/services/genshinAssets/cooking/constants";
import { toCookingRecipe } from "#src/services/genshinAssets/cooking/toCookingRecipe";
import { CookingQuality } from "genshin-world";
import { describe, expect, test } from "vitest";

const createMaterial = (id: number, foodQuality: string): MaterialRow => ({
  foodQuality,
  id,
  itemUse: [],
  materialType: "",
  nameTextMapHash: 0,
  rank: 0,
  rankLevel: 0,
  stackLimit: 0,
});

describe(toCookingRecipe, () => {
  const RECIPE_ID = 1001;
  const AVATAR_ID = 10_001;
  const SPECIAL_ITEM_ID = 108_014;
  const STRANGE_ITEM_ID = 1;
  const ORDINARY_ITEM_ID = 2;
  const DELICIOUS_ITEM_ID = 3;
  const materialMap = new Map([
    [DELICIOUS_ITEM_ID, createMaterial(DELICIOUS_ITEM_ID, "FOOD_QUALITY_DELICIOUS")],
    [ORDINARY_ITEM_ID, createMaterial(ORDINARY_ITEM_ID, "FOOD_QUALITY_ORDINARY")],
    [STRANGE_ITEM_ID, createMaterial(STRANGE_ITEM_ID, "FOOD_QUALITY_STRANGE")],
  ]);
  const createRow = (qualityOutputIds: number[]): CookRecipeRow => ({
    cookMethod: "",
    id: RECIPE_ID,
    inputVec: [{ count: 1, id: 100_011 }],
    isDefaultUnlocked: true,
    maxProficiency: 5,
    qteParam: "0.63,0.4",
    qualityOutputVec: qualityOutputIds.map((id) => ({ count: 1, id })),
    rankLevel: 1,
  });
  const createBonus = (complexParamVec: number[]): CookBonusRow => ({
    avatarId: AVATAR_ID,
    bonusType: COOK_BONUS_REPLACE_TYPE,
    complexParamVec,
    paramVec: [SPECIAL_ITEM_ID, 0],
    recipeId: RECIPE_ID,
  });

  test("should read each result's quality off its item, whatever its place in the table", () => {
    expect.hasAssertions();

    const recipe = toCookingRecipe(createRow([DELICIOUS_ITEM_ID, STRANGE_ITEM_ID, ORDINARY_ITEM_ID]), {
      bonusRows: [],
      materialMap,
      unlockItemIds: [],
    });

    expect(recipe.resultItemIds).toStrictEqual({
      [CookingQuality.Delicious]: DELICIOUS_ITEM_ID,
      [CookingQuality.Regular]: ORDINARY_ITEM_ID,
      [CookingQuality.Suspicious]: STRANGE_ITEM_ID,
    });
  });

  test("should give each quality the chance its place among the results holds", () => {
    expect.hasAssertions();

    const recipe = toCookingRecipe(createRow([STRANGE_ITEM_ID, ORDINARY_ITEM_ID, DELICIOUS_ITEM_ID]), {
      bonusRows: [createBonus([10, 15, 20])],
      materialMap,
      unlockItemIds: [],
    });

    expect(recipe.specialties).toStrictEqual([
      {
        avatarId: AVATAR_ID,
        chances: { [CookingQuality.Delicious]: 20, [CookingQuality.Regular]: 15, [CookingQuality.Suspicious]: 10 },
        itemId: SPECIAL_ITEM_ID,
      },
    ]);
  });

  test("should throw for a result whose item names no food quality", () => {
    expect.hasAssertions();

    expect(() =>
      toCookingRecipe(createRow([STRANGE_ITEM_ID, ORDINARY_ITEM_ID, 4]), {
        bonusRows: [],
        materialMap,
        unlockItemIds: [],
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 4, is no dish's result]`,
    );
  });
});
