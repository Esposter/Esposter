import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { collectForgeOrder } from "#src/services/forging/collectForgeOrder";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(collectForgeOrder, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 6;
  const RESULT_ID = 104_012;
  const recipe: ForgeRecipe = {
    forgePoint: 2000,
    id: 11_002,
    kind: ForgeRecipeKind.Enhancement,
    materials: [{ count: 3, id: 101_002 }],
    mora: 10,
    playerLevel: 2,
    queueSize: 20,
    resultCount: 1,
    resultItemId: RESULT_ID,
    seconds: UNIT_SECONDS,
    unlockItemIds: [],
  };
  const resultDefinition: ItemDefinition = {
    category: ItemCategory.Material,
    id: RESULT_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: 99,
  };
  const emptyInventory = { items: [] as InventoryItem[], nextId: 1 };

  test("should take in the units done by now and leave the rest queued from where they stopped", () => {
    expect.hasAssertions();

    const result = collectForgeOrder(
      recipe,
      { count: 3, recipeId: recipe.id, startedAt: EPOCH },
      { inventory: emptyInventory, now: EPOCH.add({ seconds: 2 * UNIT_SECONDS + UNIT_SECONDS / 2 }), resultDefinition },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.order?.count).toBe(1);
    expect(result.order?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });

  test("should free the queue once every unit is taken in", () => {
    expect.hasAssertions();

    const result = collectForgeOrder(
      recipe,
      { count: 2, recipeId: recipe.id, startedAt: EPOCH },
      { inventory: emptyInventory, now: EPOCH.add({ seconds: 2 * UNIT_SECONDS }), resultDefinition },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.order).toBeUndefined();
  });

  test("should collect nothing before the first unit is done", () => {
    expect.hasAssertions();

    const order = { count: 2, recipeId: recipe.id, startedAt: EPOCH };
    const result = collectForgeOrder(recipe, order, {
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: UNIT_SECONDS - 1 }),
      resultDefinition,
    });

    expect(result.inventory.items).toStrictEqual([]);
    expect(result.order).toStrictEqual(order);
  });

  test("should take in the done units the bag has room for and hold the first it has none for with those behind it", () => {
    expect.hasAssertions();

    const fullDefinition = { ...resultDefinition, stackLimit: 3 };
    const result = collectForgeOrder(
      recipe,
      { count: 3, recipeId: recipe.id, startedAt: EPOCH },
      {
        inventory: { items: [{ definition: fullDefinition, id: 1, quantity: 1 }], nextId: 2 },
        now: EPOCH.add({ seconds: 3 * UNIT_SECONDS }),
        resultDefinition: fullDefinition,
      },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(3);
    expect(result.order?.count).toBe(1);
    expect(result.order?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });
});
