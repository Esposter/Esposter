import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { checkIsRecipeOpen } from "#src/services/crafting/checkIsRecipeOpen";
import { describe, expect, test } from "vitest";

describe(checkIsRecipeOpen, () => {
  const ADVENTURE_RANK = 5;
  const INSTRUCTION_ITEM_ID = 221_007;
  const RECIPE_ID = 22_007;
  const tierRecipe: CraftingRecipe = {
    id: 11_002,
    kind: CraftingRecipeKind.Tier,
    materials: [{ count: 3, id: 112_003 }],
    mora: 50,
    nameTextId: "1",
    playerLevel: ADVENTURE_RANK,
    resultCount: 1,
    resultItemId: 112_004,
    unlockItemIds: [],
  };
  const instructionRecipe: CraftingRecipe = {
    ...tierRecipe,
    id: RECIPE_ID,
    kind: CraftingRecipeKind.CondensedResin,
    unlockItemIds: [INSTRUCTION_ITEM_ID],
  };

  test("should open a recipe from the start once the Adventure Rank is reached", () => {
    expect.hasAssertions();

    expect(checkIsRecipeOpen(tierRecipe, { learnedRecipeIds: [] }, ADVENTURE_RANK)).toBe(true);
    expect(checkIsRecipeOpen(tierRecipe, { learnedRecipeIds: [] }, ADVENTURE_RANK - 1)).toBe(false);
  });

  test("should keep a recipe an instruction opens shut until it is learned", () => {
    expect.hasAssertions();

    expect(checkIsRecipeOpen(instructionRecipe, { learnedRecipeIds: [] }, ADVENTURE_RANK)).toBe(false);
    expect(checkIsRecipeOpen(instructionRecipe, { learnedRecipeIds: [RECIPE_ID] }, ADVENTURE_RANK)).toBe(true);
  });
});
