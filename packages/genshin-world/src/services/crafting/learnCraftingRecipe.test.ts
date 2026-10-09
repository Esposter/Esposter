import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { learnCraftingRecipe } from "#src/services/crafting/learnCraftingRecipe";
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

describe(learnCraftingRecipe, () => {
  const INSTRUCTION_ID = 221_007;
  const OTHER_INSTRUCTION_ID = 221_067;
  const recipe: CraftingRecipe = {
    combineType: 6,
    id: 22_007,
    kind: CraftingRecipeKind.CondensedResin,
    materials: [{ count: 60, id: 106 }],
    mora: 100,
    nameTextId: "1",
    playerLevel: 10,
    resultCount: 1,
    resultItemId: 220_007,
    unlockItemIds: [INSTRUCTION_ID],
  };
  const instruction = createDefinition(INSTRUCTION_ID);
  const emptyProgress = { learnedRecipeIds: [] };

  test("should take the instruction from the bag and record the recipe as learned", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: instruction, id: 0, quantity: 1 }], nextId: 1 };

    expect(learnCraftingRecipe(recipe, INSTRUCTION_ID, { inventory, progress: emptyProgress })).toStrictEqual({
      inventory: { items: [], nextId: 1 },
      progress: { learnedRecipeIds: [recipe.id] },
    });
  });

  test("should refuse an item that does not open the recipe", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [{ definition: createDefinition(OTHER_INSTRUCTION_ID), id: 0, quantity: 1 }],
      nextId: 1,
    };

    expect(learnCraftingRecipe(recipe, OTHER_INSTRUCTION_ID, { inventory, progress: emptyProgress })).toBeUndefined();
  });

  test("should refuse an instruction the bag does not hold", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [], nextId: 0 };

    expect(learnCraftingRecipe(recipe, INSTRUCTION_ID, { inventory, progress: emptyProgress })).toBeUndefined();
  });

  test("should refuse a recipe already learned, keeping its instruction", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: instruction, id: 0, quantity: 1 }], nextId: 1 };

    expect(
      learnCraftingRecipe(recipe, INSTRUCTION_ID, { inventory, progress: { learnedRecipeIds: [recipe.id] } }),
    ).toBeUndefined();
  });
});
