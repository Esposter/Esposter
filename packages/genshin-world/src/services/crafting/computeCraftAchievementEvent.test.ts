import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { computeCraftAchievementEvent } from "#src/services/crafting/computeCraftAchievementEvent";
import { describe, expect, test } from "vitest";

describe(computeCraftAchievementEvent, () => {
  test("should count every item the crafts make, named by the recipe's combine type", () => {
    expect.hasAssertions();
    const recipe: CraftingRecipe = {
      combineType: 7,
      id: 11_001,
      kind: CraftingRecipeKind.Tier,
      materials: [{ count: 1, id: 2 }],
      mora: 0,
      nameTextId: "1",
      playerLevel: 1,
      resultCount: 3,
      resultItemId: 3,
      unlockItemIds: [],
    };
    expect(computeCraftAchievementEvent(recipe, 4)).toStrictEqual({
      kind: AchievementEventKind.ItemCrafted,
      quantity: 12,
      targetId: "7",
    });
  });
});
