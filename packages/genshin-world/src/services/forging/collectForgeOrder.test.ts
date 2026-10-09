import type { ForgeOrder } from "#src/models/forging/ForgeOrder";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { ForgeTalentKind } from "#src/models/forging/ForgeTalent";
import { collectForgeOrder } from "#src/services/forging/collectForgeOrder";
import { FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(collectForgeOrder, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 6;
  const RESULT_ID = 104_012;
  const EXP_ID = 102;
  const recipe: ForgeRecipe = {
    forgePoint: 2000,
    forgeType: FORGE_ENHANCEMENT_TYPE,
    id: 11_002,
    kind: ForgeRecipeKind.Enhancement,
    materials: [{ count: 3, id: 101_002 }],
    mora: 10,
    playerLevel: 2,
    queueSize: 20,
    results: [{ count: 1, itemId: RESULT_ID, weight: 1 }],
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
  const definitions = new Map([[RESULT_ID, resultDefinition]]);
  const emptyInventory = { items: [] as InventoryItem[], nextId: 1 };
  const order = (count: number): ForgeOrder => ({
    count,
    recipeId: recipe.id,
    startedAt: EPOCH,
    unitSeconds: UNIT_SECONDS,
  });
  const collectArguments = { definitions, inventory: emptyInventory, random: () => 0, talents: [] };

  test("should take in the units done by now and leave the rest queued from where they stopped", () => {
    expect.hasAssertions();

    const result = collectForgeOrder(recipe, order(3), {
      ...collectArguments,
      now: EPOCH.add({ seconds: 2 * UNIT_SECONDS + UNIT_SECONDS / 2 }),
    });

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.order?.count).toBe(1);
    expect(result.order?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });

  test("should free the queue once every unit is taken in", () => {
    expect.hasAssertions();

    const result = collectForgeOrder(recipe, order(2), {
      ...collectArguments,
      now: EPOCH.add({ seconds: 2 * UNIT_SECONDS }),
    });

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.order).toBeUndefined();
  });

  test("should collect nothing before the first unit is done", () => {
    expect.hasAssertions();

    const queued = order(2);
    const result = collectForgeOrder(recipe, queued, {
      ...collectArguments,
      now: EPOCH.add({ seconds: UNIT_SECONDS - 1 }),
    });

    expect(result.inventory.items).toStrictEqual([]);
    expect(result.order).toStrictEqual(queued);
  });

  test("should double a unit's result where a talent's extra chance rolls under it", () => {
    expect.hasAssertions();

    const talents = [{ forgeType: FORGE_ENHANCEMENT_TYPE, kind: ForgeTalentKind.ExtraResult, ratio: 0.2 }];
    const result = collectForgeOrder(recipe, order(2), {
      ...collectArguments,
      now: EPOCH.add({ seconds: 2 * UNIT_SECONDS }),
      random: () => 0.1,
      talents,
    });

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(4);
  });

  test("should take a virtual result out of the bag as Adventure EXP", () => {
    expect.hasAssertions();

    const expRecipe = {
      ...recipe,
      results: [
        { count: 1, itemId: RESULT_ID, weight: 1 },
        { count: 100, itemId: EXP_ID, weight: 1 },
      ],
    };
    const result = collectForgeOrder(expRecipe, order(2), {
      ...collectArguments,
      now: EPOCH.add({ seconds: 2 * UNIT_SECONDS }),
      random: () => 0.75,
    });

    expect(result.adventureExp).toBe(200);
    expect(result.inventory.items).toStrictEqual([]);
  });

  test("should take in the done units the bag has room for and hold the first it has none for with those behind it", () => {
    expect.hasAssertions();

    const fullDefinition = { ...resultDefinition, stackLimit: 3 };
    const result = collectForgeOrder(recipe, order(3), {
      ...collectArguments,
      definitions: new Map([[RESULT_ID, fullDefinition]]),
      inventory: { items: [{ definition: fullDefinition, id: 1, quantity: 1 }], nextId: 2 },
      now: EPOCH.add({ seconds: 3 * UNIT_SECONDS }),
    });

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(3);
    expect(result.order?.count).toBe(1);
    expect(result.order?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });
});
