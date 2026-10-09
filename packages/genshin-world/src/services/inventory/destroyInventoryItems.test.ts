import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { DESTROY_RARITY_LIMIT } from "#src/services/inventory/constants";
import { destroyInventoryItems } from "#src/services/inventory/destroyInventoryItems";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createItem = (id: number, category: ItemCategory): InventoryItem => ({
  definition: { category, id, name: "", rank: 0, rarity: DESTROY_RARITY_LIMIT, stackLimit: 1 },
  id,
  level: 1,
  quantity: 1,
});

describe(destroyInventoryItems, () => {
  const weapon = createItem(0, ItemCategory.Weapon);
  const artifact = createItem(1, ItemCategory.Artifact);
  const material = createItem(2, ItemCategory.Material);
  const items = [weapon, artifact, material];

  test("removes every chosen entry the bag may destroy", () => {
    expect.hasAssertions();

    expect(destroyInventoryItems(items, [weapon.id, artifact.id])).toStrictEqual([material]);
  });

  test("refuses the whole destruction when one chosen entry is a material", () => {
    expect.hasAssertions();

    expect(() => destroyInventoryItems(items, [weapon.id, material.id])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: destroyInventoryItem, 2]`,
    );
  });
});
