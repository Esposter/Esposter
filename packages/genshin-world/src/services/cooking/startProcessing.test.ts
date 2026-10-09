import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { startProcessing } from "#src/services/cooking/startProcessing";
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

describe(startProcessing, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 60;
  const INGREDIENT_ID = 100_017;
  const QUEUE_SIZE = 2;
  const recipe: ProcessingRecipe = {
    costTime: UNIT_SECONDS,
    id: 1001,
    ingredients: [{ count: 2, id: INGREDIENT_ID }],
    isDefaultUnlocked: true,
    queueSize: QUEUE_SIZE,
    rankLevel: 1,
    result: { count: 1, id: 110_001 },
  };
  const createInventory = (ingredientCount: number) => ({
    items: [{ definition: createDefinition(INGREDIENT_ID), id: 1, quantity: ingredientCount }],
    nextId: 2,
  });

  test("should take every unit's ingredients at once and start an idle queue from now", () => {
    expect.hasAssertions();

    const result = startProcessing(recipe, 2, { inventory: createInventory(4), job: undefined, now: EPOCH });

    expect(countInventoryItem(result?.inventory.items ?? [], INGREDIENT_ID)).toBe(0);
    expect(result?.job.count).toBe(2);
    expect(result?.job.startedAt.equals(EPOCH)).toBe(true);
  });

  test("should be refused for a processing that is not known from the start", () => {
    expect.hasAssertions();

    expect(
      startProcessing({ ...recipe, isDefaultUnlocked: false }, 1, {
        inventory: createInventory(2),
        job: undefined,
        now: EPOCH,
      }),
    ).toBeUndefined();
  });

  test("should be refused where the bag holds too few ingredients", () => {
    expect.hasAssertions();

    expect(startProcessing(recipe, 2, { inventory: createInventory(3), job: undefined, now: EPOCH })).toBeUndefined();
  });

  test("should be refused where the queue would hold more units than its size", () => {
    expect.hasAssertions();

    expect(
      startProcessing(recipe, 2, { inventory: createInventory(4), job: { count: 1, startedAt: EPOCH }, now: EPOCH }),
    ).toBeUndefined();
  });

  test("should queue a unit behind the one running, which keeps its start", () => {
    expect.hasAssertions();

    const result = startProcessing(recipe, 1, {
      inventory: createInventory(2),
      job: { count: 1, startedAt: EPOCH },
      now: EPOCH.add({ seconds: UNIT_SECONDS / 2 }),
    });

    expect(result?.job.count).toBe(2);
    expect(result?.job.startedAt.equals(EPOCH)).toBe(true);
  });

  test("should restart a queue whose units are all done from now, the done ones still counted", () => {
    expect.hasAssertions();

    const now = EPOCH.add({ seconds: 3 * UNIT_SECONDS });
    const result = startProcessing(recipe, 1, {
      inventory: createInventory(2),
      job: { count: 1, startedAt: EPOCH },
      now,
    });

    expect(result?.job.count).toBe(2);
    expect(result?.job.startedAt.equals(now.subtract({ seconds: UNIT_SECONDS }))).toBe(true);
  });

  test("should be refused for a count that is not whole", () => {
    expect.hasAssertions();

    expect(startProcessing(recipe, 1.5, { inventory: createInventory(4), job: undefined, now: EPOCH })).toBeUndefined();
  });
});
