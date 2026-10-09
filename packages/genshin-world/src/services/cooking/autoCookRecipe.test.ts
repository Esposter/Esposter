import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { autoCookRecipe } from "#src/services/cooking/autoCookRecipe";
import { COOKING_BATCH_LIMIT } from "#src/services/cooking/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createDefinition = (id: number): ItemDefinition => ({
  category: ItemCategory.Food,
  id,
  name: "",
  rank: 0,
  rarity: 0,
  stackLimit: COOKING_BATCH_LIMIT,
});

describe(autoCookRecipe, () => {
  const AVATAR_ID = 10_001;
  const INGREDIENT_ID = 100_011;
  const DELICIOUS_ITEM_ID = 108_013;
  const SPECIAL_ITEM_ID = 108_014;
  const createRecipe = (): CookingRecipe => ({
    id: 1001,
    ingredients: [{ count: 1, id: INGREDIENT_ID }],
    isDefaultUnlocked: true,
    maxProficiency: 2,
    nameTextId: "1",
    qteParam: [0.5, 0.4],
    rankLevel: 1,
    resultItemIds: {
      [CookingQuality.Delicious]: DELICIOUS_ITEM_ID,
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
  });
  const createInventory = (ingredientCount: number) => ({
    items: [{ definition: createDefinition(INGREDIENT_ID), id: 1, quantity: ingredientCount }],
    nextId: 2,
  });
  const provenProgress = { learnedRecipeIds: [], proficiencies: { 1001: 2 } };

  test("should be refused while the dish's proficiency is not full", () => {
    expect.hasAssertions();

    const recipe = createRecipe();

    expect(
      autoCookRecipe(recipe, {
        avatarId: AVATAR_ID,
        getDefinition: createDefinition,
        inventory: createInventory(3),
        progress: { learnedRecipeIds: [], proficiencies: { 1001: 1 } },
        random: () => 0.99,
      }),
    ).toBeUndefined();
  });

  test("should make as many Delicious dishes as the ingredients allow, up to the batch limit", () => {
    expect.hasAssertions();

    const result = autoCookRecipe(createRecipe(), {
      avatarId: AVATAR_ID,
      getDefinition: createDefinition,
      inventory: createInventory(COOKING_BATCH_LIMIT + 5),
      progress: provenProgress,
      random: () => 0.99,
    });

    expect(countInventoryItem(result?.items ?? [], DELICIOUS_ITEM_ID)).toBe(COOKING_BATCH_LIMIT);
    expect(countInventoryItem(result?.items ?? [], INGREDIENT_ID)).toBe(5);
  });

  test("should make the character's special dish for every roll under its chance", () => {
    expect.hasAssertions();

    const result = autoCookRecipe(createRecipe(), {
      avatarId: AVATAR_ID,
      getDefinition: createDefinition,
      inventory: createInventory(3),
      progress: provenProgress,
      random: () => 0,
    });

    expect(countInventoryItem(result?.items ?? [], SPECIAL_ITEM_ID)).toBe(3);
  });
});
