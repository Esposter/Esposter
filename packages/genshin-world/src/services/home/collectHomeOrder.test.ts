import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeOrder } from "#src/models/home/HomeOrder";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { collectHomeOrder } from "#src/services/home/collectHomeOrder";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(collectHomeOrder, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const SECONDS = 6;
  const FURNISHING_ID = 360_101;
  const TRUST_EXP = 60;
  const blueprint: HomeBlueprint = {
    id: FURNISHING_ID,
    materials: [{ count: 1, id: 101_307 }],
    seconds: SECONDS,
    trustExp: TRUST_EXP,
    unlockItemIds: [],
  };
  const resultDefinition: ItemDefinition = {
    category: ItemCategory.Furnishing,
    id: FURNISHING_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: 1,
  };
  const order: HomeOrder = { blueprintId: FURNISHING_ID, startedAt: EPOCH };
  const progress: HomeProgress = {
    accruedAt: EPOCH,
    learnedBlueprintIds: [FURNISHING_ID],
    madeBlueprintIds: [],
    orders: [order],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };
  const emptyInventory = { items: [] as InventoryItem[], nextId: 1 };

  test("should keep the furnishing queued until its seconds have passed", () => {
    expect.hasAssertions();

    const result = collectHomeOrder(order, blueprint, {
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: SECONDS - 1 }),
      progress,
      resultDefinition,
    });

    expect(result.progress).toStrictEqual(progress);
    expect(countInventoryItem(result.inventory.items, FURNISHING_ID)).toBe(0);
  });

  test("should take the furnishing into the bag and free its queue, giving Trust EXP only on the first making", () => {
    expect.hasAssertions();

    const first = collectHomeOrder(order, blueprint, {
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: SECONDS }),
      progress,
      resultDefinition,
    });

    expect(countInventoryItem(first.inventory.items, FURNISHING_ID)).toBe(1);
    expect(first.progress.orders).toStrictEqual([]);
    expect(first.progress.trustExp).toBe(TRUST_EXP);

    const again = collectHomeOrder(order, blueprint, {
      inventory: emptyInventory,
      now: EPOCH.add({ seconds: SECONDS }),
      progress: { ...first.progress, orders: [order] },
      resultDefinition,
    });

    expect(again.progress.trustExp).toBe(TRUST_EXP);
  });
});
