import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { computeBagObtainEvents } from "#src/services/achievement/computeBagObtainEvents";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createStack = (id: number, quantity: number, entryId: number): InventoryItem => ({
  definition: { category: ItemCategory.Material, id, name: "", rank: 0, rarity: 1, stackLimit: 99 },
  id: entryId,
  quantity,
});

describe(computeBagObtainEvents, () => {
  const ITEM_ID = 41;
  const OTHER_ITEM_ID = 42;

  test("a bag write counts the items it gains, by item", () => {
    expect.hasAssertions();

    expect(
      computeBagObtainEvents(
        [createStack(ITEM_ID, 2, 1)],
        [createStack(ITEM_ID, 2, 1), createStack(ITEM_ID, 3, 2), createStack(OTHER_ITEM_ID, 1, 3)],
      ),
    ).toStrictEqual([
      { kind: AchievementEventKind.ItemObtained, quantity: 3, targetId: String(ITEM_ID) },
      { kind: AchievementEventKind.ItemObtained, quantity: 1, targetId: String(OTHER_ITEM_ID) },
    ]);
  });

  test("a bag write that takes items obtains nothing", () => {
    expect.hasAssertions();

    expect(computeBagObtainEvents([createStack(ITEM_ID, 5, 1)], [createStack(ITEM_ID, 2, 1)])).toStrictEqual([]);
  });
});
