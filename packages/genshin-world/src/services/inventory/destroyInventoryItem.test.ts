import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { DESTROY_RARITY_LIMIT } from "#src/services/inventory/constants";
import { destroyInventoryItem } from "#src/services/inventory/destroyInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createItem = (id: number, category: ItemCategory, rarity: number): InventoryItem => ({
  definition: { category, id, name: "", rank: 0, rarity, stackLimit: 1 },
  id,
  level: 1,
  quantity: 1,
});

describe(destroyInventoryItem, () => {
  const weapon = createItem(0, ItemCategory.Weapon, DESTROY_RARITY_LIMIT);
  const material = createItem(1, ItemCategory.Material, 1);
  const items = [weapon, material];

  test("removes a weapon or an artifact of up to four stars", () => {
    expect.hasAssertions();

    expect(destroyInventoryItem(items, weapon.id)).toStrictEqual([material]);
  });

  test("refuses a material, which the bag never destroys", () => {
    expect.hasAssertions();

    expect(() => destroyInventoryItem(items, material.id)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: destroyInventoryItem, 1]`,
    );
  });
});
