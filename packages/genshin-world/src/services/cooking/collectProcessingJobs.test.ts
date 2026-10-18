import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { collectProcessingJobs } from "#src/services/cooking/collectProcessingJobs";
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

describe(collectProcessingJobs, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 60;
  const PROCESSING_ID = 1001;
  const RESULT_ID = 110_001;
  const recipe: ProcessingRecipe = {
    costTime: UNIT_SECONDS,
    id: PROCESSING_ID,
    ingredients: [{ count: 2, id: 100_017 }],
    isDefaultUnlocked: true,
    nameTextId: "1",
    queueSize: 99,
    rankLevel: 1,
    result: { count: 1, id: RESULT_ID },
  };
  const emptyInventory = { items: [] as InventoryItem[], nextId: 1 };

  test("queues with no unit done are returned as the same jobs", () => {
    expect.hasAssertions();
    const jobs = { [PROCESSING_ID]: { count: 3, startedAt: EPOCH } };

    const result = collectProcessingJobs([recipe], jobs, {
      getResultDefinition: () => createDefinition(RESULT_ID),
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: UNIT_SECONDS / 2 }),
    });

    expect(result.jobs).toBe(jobs);
  });

  test("units done by a moment are put into the bag", () => {
    expect.hasAssertions();

    const result = collectProcessingJobs(
      [recipe],
      { [PROCESSING_ID]: { count: 3, startedAt: EPOCH } },
      {
        getResultDefinition: () => createDefinition(RESULT_ID),
        inventory: emptyInventory,
        now: EPOCH.add({ seconds: 2 * UNIT_SECONDS }),
      },
    );

    expect(countInventoryItem(result.inventory.items, RESULT_ID)).toBe(2);
    expect(result.jobs[PROCESSING_ID]?.count).toBe(1);
  });

  test("a unit with no room in the bag waits in the queue", () => {
    expect.hasAssertions();

    const fullInventory = { items: [{ definition: createDefinition(RESULT_ID, 1), id: 1, quantity: 1 }], nextId: 2 };
    const job = { count: 1, startedAt: EPOCH };

    const result = collectProcessingJobs(
      [recipe],
      { [PROCESSING_ID]: job },
      {
        getResultDefinition: () => createDefinition(RESULT_ID, 1),
        inventory: fullInventory,
        now: EPOCH.add({ seconds: UNIT_SECONDS }),
      },
    );

    expect(result).toStrictEqual({ inventory: fullInventory, jobs: { [PROCESSING_ID]: job } });
  });
});
