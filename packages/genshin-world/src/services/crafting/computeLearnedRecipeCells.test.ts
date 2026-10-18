import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { CONVERSION_TAB_ID_OFFSET } from "#src/services/crafting/constants";
import { computeLearnedRecipeCells } from "#src/services/crafting/computeLearnedRecipeCells";
import { describe, expect, test } from "vitest";

const recipe = (overrides: Partial<CraftingRecipe> & Pick<CraftingRecipe, "id" | "nameTextId">): CraftingRecipe => ({
  combineType: 7,
  kind: CraftingRecipeKind.Tier,
  materials: [{ count: 3, id: 1001 }],
  mora: 100,
  playerLevel: 1,
  resultCount: 1,
  resultItemId: 2001,
  unlockItemIds: [],
  ...overrides,
});

describe(computeLearnedRecipeCells, () => {
  test("the bench lists learned recipes with their crafted counts", () => {
    expect.hasAssertions();

    expect(
      computeLearnedRecipeCells(
        [
          recipe({ id: 1, nameTextId: "ALPHA" }),
          recipe({ id: 2, nameTextId: "BETA", unlockItemIds: [9001] }),
          recipe({ id: 3, nameTextId: "GAMMA", unlockItemIds: [9001] }),
          recipe({ combineType: 8, id: 4, nameTextId: "DELTA" }),
          recipe({ id: 5, nameTextId: "EPSILON", playerLevel: 9 }),
        ],
        {
          adventureRank: 5,
          craftedCountMap: new Map([[1, 2]]),
          nameText: { ALPHA: "Alpha", BETA: "Beta", DELTA: "Delta", EPSILON: "Epsilon", GAMMA: "Gamma" },
          progress: { learnedRecipeIds: [3] },
          tabId: 7,
        },
      ),
    ).toStrictEqual([
      { count: 2, id: 1, name: "Alpha" },
      { count: 0, id: 3, name: "Gamma" },
    ]);
  });

  test("a conversion's tab is apart from the craft tab of its combine type", () => {
    expect.hasAssertions();

    const recipes = [
      recipe({ combineType: 5, id: 1, nameTextId: "ALPHA" }),
      recipe({ combineType: 5, id: 2, kind: CraftingRecipeKind.Convert, nameTextId: "BETA", playerLevel: 0 }),
    ];
    const options = {
      adventureRank: 5,
      craftedCountMap: new Map<number, number>(),
      nameText: { ALPHA: "Alpha", BETA: "Beta" },
      progress: { learnedRecipeIds: [] },
    };

    expect(computeLearnedRecipeCells(recipes, { ...options, tabId: 5 })).toStrictEqual([
      { count: 0, id: 1, name: "Alpha" },
    ]);
    expect(computeLearnedRecipeCells(recipes, { ...options, tabId: CONVERSION_TAB_ID_OFFSET + 5 })).toStrictEqual([
      { count: 0, id: 2, name: "Beta" },
    ]);
  });
});
