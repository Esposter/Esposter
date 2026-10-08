import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { startForge } from "#src/services/forging/startForge";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
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

describe(startForge, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const EPOCH_GAME_DAY = EPOCH.toZonedDateTimeISO("Asia/Shanghai").subtract({ hours: 4 }).toPlainDate();
  const INGREDIENT_ID = 101_002;
  const recipe: ForgeRecipe = {
    forgePoint: 2000,
    id: 11_002,
    kind: ForgeRecipeKind.Enhancement,
    materials: [{ count: 3, id: INGREDIENT_ID }],
    mora: 10,
    playerLevel: 2,
    queueSize: 20,
    resultCount: 1,
    resultItemId: 104_012,
    seconds: 6,
    unlockItemIds: [],
  };
  const progress: ForgeProgress = {
    forgedPoints: 0,
    forgedPointsDay: EPOCH_GAME_DAY,
    learnedRecipeIds: [],
    orders: [],
  };
  const createInventory = (ingredientCount: number) => ({
    items: [{ definition: createDefinition(INGREDIENT_ID), id: 1, quantity: ingredientCount }],
    nextId: 2,
  });
  const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
  const startArguments = { adventureRank: 2, inventory: createInventory(6), now: EPOCH, progress, wallet };

  test("should take the materials and Mora of every unit, count the points, and queue the order from now", () => {
    expect.hasAssertions();

    const result = startForge(recipe, 2, startArguments);

    expect(countInventoryItem(result?.inventory.items ?? [], INGREDIENT_ID)).toBe(0);
    expect(result?.wallet[Currency.Mora]).toBe(80);
    expect(result?.progress.forgedPoints).toBe(4000);
    expect(result?.progress.orders).toStrictEqual([{ count: 2, recipeId: recipe.id, startedAt: EPOCH }]);
  });

  test("should be refused where every queue the rank opens is busy", () => {
    expect.hasAssertions();

    const busyProgress = { ...progress, orders: [{ count: 1, recipeId: recipe.id, startedAt: EPOCH }] };

    expect(startForge(recipe, 1, { ...startArguments, progress: busyProgress })).toBeUndefined();
  });

  test("should be refused where the units would pass the day's forge points", () => {
    expect.hasAssertions();

    expect(
      startForge(recipe, 1, { ...startArguments, progress: { ...progress, forgedPoints: 399_000 } }),
    ).toBeUndefined();
  });

  test("should be refused where the bag holds too few materials for every unit", () => {
    expect.hasAssertions();

    expect(startForge(recipe, 2, { ...startArguments, inventory: createInventory(5) })).toBeUndefined();
  });
});
