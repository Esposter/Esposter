import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { rollCraftingTalent } from "#src/services/crafting/rollCraftingTalent";
import { describe, expect, test } from "vitest";

const drawsOf = (draws: number[]) => {
  const remainingDraws = [...draws];
  return () => remainingDraws.shift() ?? 1;
};

describe(rollCraftingTalent, () => {
  const SUCROSE_AVATAR_ID = 10_000_043;
  const XINGQIU_AVATAR_ID = 10_000_025;
  const NO_TALENT_AVATAR_ID = 1;
  const ENHANCEMENT_COMBINE_TYPE = 1;
  const TALENT_MATERIAL_COMBINE_TYPE = 3;
  const MATERIAL_ID = 112_002;
  const RESULT_ITEM_ID = 112_003;
  const recipe: CraftingRecipe = {
    combineType: ENHANCEMENT_COMBINE_TYPE,
    id: 11_002,
    kind: CraftingRecipeKind.Tier,
    materials: [{ count: 3, id: MATERIAL_ID }],
    mora: 50,
    nameTextId: "1",
    playerLevel: 5,
    resultCount: 1,
    resultItemId: RESULT_ITEM_ID,
    unlockItemIds: [],
  };

  test("should double the result of a craft whose draw falls under the talent's chance", () => {
    expect.hasAssertions();

    expect(rollCraftingTalent(SUCROSE_AVATAR_ID, recipe, 2, drawsOf([0.05, 0.5]))).toStrictEqual([
      { count: 1, id: RESULT_ITEM_ID },
    ]);
  });

  test("should refund one of the recipe's first material when a combine type the talent names is crafted", () => {
    expect.hasAssertions();

    const talentRecipe = { ...recipe, combineType: TALENT_MATERIAL_COMBINE_TYPE };

    expect(rollCraftingTalent(XINGQIU_AVATAR_ID, talentRecipe, 1, drawsOf([0.1]))).toStrictEqual([
      { count: 1, id: MATERIAL_ID },
    ]);
  });

  test("should add nothing for a combine type the talent does not name", () => {
    expect.hasAssertions();

    expect(rollCraftingTalent(SUCROSE_AVATAR_ID, { ...recipe, combineType: 2 }, 1, drawsOf([0]))).toStrictEqual([]);
  });

  test("should add nothing for a character with no crafting talent", () => {
    expect.hasAssertions();

    expect(rollCraftingTalent(NO_TALENT_AVATAR_ID, recipe, 1, drawsOf([0]))).toStrictEqual([]);
  });
});
