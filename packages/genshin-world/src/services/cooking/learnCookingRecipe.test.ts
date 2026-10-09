import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { learnCookingRecipe } from "#src/services/cooking/learnCookingRecipe";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createDefinition = (id: number): ItemDefinition => ({
  category: ItemCategory.Material,
  id,
  name: "",
  rank: 0,
  rarity: 0,
  stackLimit: 99,
});

describe(learnCookingRecipe, () => {
  const INSTRUCTION_ID = 109_101;
  const OTHER_ITEM_ID = 109_102;
  const recipe: CookingRecipe = {
    id: 1001,
    ingredients: [{ count: 1, id: 100_011 }],
    isDefaultUnlocked: false,
    maxProficiency: 5,
    nameTextId: "1",
    qteParam: [0.5, 0.4],
    rankLevel: 1,
    resultItemIds: {
      [CookingQuality.Delicious]: 108_013,
      [CookingQuality.Regular]: 108_012,
      [CookingQuality.Suspicious]: 108_011,
    },
    specialties: [],
    unlockItemIds: [INSTRUCTION_ID],
  };
  const progress = { learnedRecipeIds: [], proficiencies: {} };
  const inventory = { items: [{ definition: createDefinition(INSTRUCTION_ID), id: 1, quantity: 1 }], nextId: 2 };

  test("should take the instruction from the bag and record the dish as learned", () => {
    expect.hasAssertions();

    const result = learnCookingRecipe(recipe, INSTRUCTION_ID, { inventory, progress });

    expect(countInventoryItem(result?.inventory.items ?? [], INSTRUCTION_ID)).toBe(0);
    expect(result?.progress.learnedRecipeIds).toStrictEqual([recipe.id]);
  });

  test("should be refused for an item that is not one of the dish's instructions", () => {
    expect.hasAssertions();

    expect(
      learnCookingRecipe(recipe, OTHER_ITEM_ID, {
        inventory: { items: [{ definition: createDefinition(OTHER_ITEM_ID), id: 1, quantity: 1 }], nextId: 2 },
        progress,
      }),
    ).toBeUndefined();
  });

  test("should be refused for a dish already learned", () => {
    expect.hasAssertions();

    expect(
      learnCookingRecipe(recipe, INSTRUCTION_ID, {
        inventory,
        progress: { learnedRecipeIds: [recipe.id], proficiencies: {} },
      }),
    ).toBeUndefined();
  });
});
