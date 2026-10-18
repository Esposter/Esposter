import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(takeInventoryEntry, () => {
  const definition = { category: ItemCategory.Weapon, id: 1, name: "", rank: 0, rarity: 0, stackLimit: 1 };
  const items: InventoryItem[] = [
    { ascension: 0, definition, experience: 0, id: 0, level: 1, quantity: 1, refinement: 1 },
    { ascension: 0, definition, experience: 0, id: 1, level: 1, quantity: 1, refinement: 1 },
  ];

  test("takes out the entry it is given and keeps the others", () => {
    expect.hasAssertions();

    expect(takeInventoryEntry(items, 1)).toStrictEqual([items[0]]);
  });

  test("refuses an entry the bag does not hold", () => {
    expect.hasAssertions();

    expect(() => takeInventoryEntry(items, 2)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: takeInventoryEntry, entry 2]`,
    );
  });
});
