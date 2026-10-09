import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { startForge } from "#src/services/forging/startForge";
import { FORGE_ENHANCEMENT_TYPE, MAGICAL_CRYSTAL_CHUNK_ITEM_ID } from "#src/services/forging/constants";
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
  const VENTI_ID = 10_000_022;
  const DILUC_ID = 10_000_016;
  const CLAYMORE_FORGE_TYPE = 5;
  const recipe: ForgeRecipe = {
    forgePoint: 2000,
    forgeType: FORGE_ENHANCEMENT_TYPE,
    id: 11_002,
    kind: ForgeRecipeKind.Enhancement,
    materials: [{ count: 3, id: INGREDIENT_ID }],
    mora: 10,
    playerLevel: 2,
    queueSize: 20,
    results: [{ count: 1, itemId: 104_012, weight: 1 }],
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
  const definitions = new Map([[INGREDIENT_ID, createDefinition(INGREDIENT_ID)]]);
  const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
  const startArguments = {
    adventureRank: 2,
    definitions,
    inventory: createInventory(6),
    isInRealm: false,
    now: EPOCH,
    partyCharacterIds: [],
    progress,
    wallet,
  };

  test("should take the materials and Mora of every unit, count the points, and queue the order from now", () => {
    expect.hasAssertions();

    const result = startForge(recipe, 2, startArguments);

    expect(countInventoryItem(result?.inventory.items ?? [], INGREDIENT_ID)).toBe(0);
    expect(result?.wallet[Currency.Mora]).toBe(80);
    expect(result?.progress.forgedPoints).toBe(4000);
    expect(result?.progress.orders).toStrictEqual([
      { count: 2, recipeId: recipe.id, startedAt: EPOCH, unitSeconds: 6 },
    ]);
  });

  test("should be refused where every queue the rank opens is busy", () => {
    expect.hasAssertions();

    const busyProgress = { ...progress, orders: [{ count: 1, recipeId: recipe.id, startedAt: EPOCH, unitSeconds: 6 }] };

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

  test("should be refused for a count that is not whole", () => {
    expect.hasAssertions();

    expect(startForge(recipe, 1.5, startArguments)).toBeUndefined();
  });

  test("should refuse in the Serenitea Pot a recipe that takes a Magical Crystal Chunk, and forge it anywhere else", () => {
    expect.hasAssertions();

    const chunkRecipe = { ...recipe, materials: [{ count: 1, id: MAGICAL_CRYSTAL_CHUNK_ITEM_ID }] };
    const chunkDefinitions = new Map([
      [MAGICAL_CRYSTAL_CHUNK_ITEM_ID, createDefinition(MAGICAL_CRYSTAL_CHUNK_ITEM_ID)],
    ]);
    const chunkInventory = {
      items: [{ definition: createDefinition(MAGICAL_CRYSTAL_CHUNK_ITEM_ID), id: 1, quantity: 3 }],
      nextId: 2,
    };
    const chunkArguments = { ...startArguments, definitions: chunkDefinitions, inventory: chunkInventory };

    expect(startForge(chunkRecipe, 1, { ...chunkArguments, isInRealm: true })).toBeUndefined();
    expect(startForge(chunkRecipe, 1, chunkArguments)).toBeDefined();
  });

  test("should save a unit's seconds where a party's Venti gives an enhancement recipe its reduce talent", () => {
    expect.hasAssertions();

    const result = startForge(recipe, 1, { ...startArguments, partyCharacterIds: [VENTI_ID] });

    expect(result?.progress.orders).toStrictEqual([
      { count: 1, recipeId: recipe.id, startedAt: EPOCH, unitSeconds: 5 },
    ]);
  });

  test("should refund a weapon's ores at its claymore talent's share, and no ore of another forge type", () => {
    expect.hasAssertions();

    const weaponRecipe: ForgeRecipe = {
      ...recipe,
      forgePoint: 0,
      forgeType: CLAYMORE_FORGE_TYPE,
      kind: ForgeRecipeKind.Weapon,
      materials: [{ count: 50, id: INGREDIENT_ID }],
      mora: 500,
      queueSize: 2,
      seconds: 10,
    };
    const weaponInventory = {
      items: [{ definition: createDefinition(INGREDIENT_ID), id: 1, quantity: 100 }],
      nextId: 2,
    };
    const weaponArguments = {
      ...startArguments,
      inventory: weaponInventory,
      partyCharacterIds: [DILUC_ID],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 1000 },
    };

    const result = startForge(weaponRecipe, 2, weaponArguments);
    const enhancementResult = startForge(recipe, 1, { ...startArguments, partyCharacterIds: [DILUC_ID] });

    expect(countInventoryItem(result?.inventory.items ?? [], INGREDIENT_ID)).toBe(15);
    expect(countInventoryItem(enhancementResult?.inventory.items ?? [], INGREDIENT_ID)).toBe(3);
  });
});
