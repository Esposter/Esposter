import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { collectProcessing } from "#src/services/cooking/collectProcessing";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createDefinition = (id: number, stackLimit = 99): ItemDefinition => ({
  category: ItemCategory.Material,
  id,
  name: "",
  rank: 0,
  rarity: 0,
  stackLimit,
});

describe(collectProcessing, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 60;
  const RESULT_ID = 110_001;
  const recipe: ProcessingRecipe = {
    costTime: UNIT_SECONDS,
    id: 1001,
    ingredients: [{ count: 2, id: 100_017 }],
    isDefaultUnlocked: true,
    queueSize: 99,
    rankLevel: 1,
    result: { count: 1, id: RESULT_ID },
  };
  const emptyInventory = { items: [] as InventoryItem[], nextId: 1 };

  test("should take in the units done by now and leave the rest queued from where they stopped", () => {
    expect.hasAssertions();

    const result = collectProcessing(
      recipe,
      { count: 3, startedAt: EPOCH },
      {
        inventory: emptyInventory,
        now: EPOCH.add({ seconds: 2 * UNIT_SECONDS + UNIT_SECONDS / 2 }),
        resultDefinition: createDefinition(RESULT_ID),
      },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.job?.count).toBe(1);
    expect(result.job?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });

  test("should collect nothing before the first unit is done", () => {
    expect.hasAssertions();

    const job = { count: 3, startedAt: EPOCH };
    const result = collectProcessing(recipe, job, {
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: UNIT_SECONDS - 1 }),
      resultDefinition: createDefinition(RESULT_ID),
    });

    expect(result).toStrictEqual({ inventory: emptyInventory, job });
  });

  test("should drop the queue once every unit is collected", () => {
    expect.hasAssertions();

    const result = collectProcessing(
      recipe,
      { count: 1, startedAt: EPOCH },
      {
        inventory: emptyInventory,
        now: EPOCH.add({ seconds: UNIT_SECONDS }),
        resultDefinition: createDefinition(RESULT_ID),
      },
    );

    expect(result.job).toBeUndefined();
    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(1);
  });

  test("should hold a done unit in the queue where the bag has no room for its result", () => {
    expect.hasAssertions();

    const fullInventory = { items: [{ definition: createDefinition(RESULT_ID, 1), id: 1, quantity: 1 }], nextId: 2 };
    const job = { count: 1, startedAt: EPOCH };
    const result = collectProcessing(recipe, job, {
      inventory: fullInventory,
      now: EPOCH.add({ seconds: UNIT_SECONDS }),
      resultDefinition: createDefinition(RESULT_ID, 1),
    });

    expect(result).toStrictEqual({ inventory: fullInventory, job });
  });

  test("should take in the done units the bag has room for and hold the first it has none for with those behind it", () => {
    expect.hasAssertions();

    const definition = createDefinition(RESULT_ID, 3);
    const result = collectProcessing(
      recipe,
      { count: 3, startedAt: EPOCH },
      {
        inventory: { items: [{ definition, id: 1, quantity: 1 }], nextId: 2 },
        now: EPOCH.add({ seconds: 3 * UNIT_SECONDS }),
        resultDefinition: definition,
      },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(3);
    expect(result.job?.count).toBe(1);
    expect(result.job?.startedAt.equals(EPOCH.add({ seconds: 2 * UNIT_SECONDS }))).toBe(true);
  });
});
