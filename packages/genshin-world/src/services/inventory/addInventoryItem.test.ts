import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { ARTIFACT_START_LEVEL, INVENTORY_KIND_LIMIT, WEAPON_START_LEVEL } from "#src/services/inventory/constants";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ItemCategory } from "genshin-interface";
import { assert, describe, expect, test } from "vitest";

const createDefinition = (category: ItemCategory, id: number, stackLimit = 1): ItemDefinition => ({
  category,
  id,
  rank: 0,
  rarity: 0,
  stackLimit,
});

describe(addInventoryItem, () => {
  const emptyInventory: Inventory = { items: [], nextId: 0 };
  const material = createDefinition(ItemCategory.Material, 0, 2);

  test("fills a stack to its item's limit and leaves the rest", () => {
    expect.hasAssertions();

    const { inventory } = addInventoryItem(emptyInventory, material, 1);

    expect(addInventoryItem(inventory, material, 2)).toStrictEqual({
      inventory: { items: [{ definition: material, id: 0, quantity: 2 }], nextId: 1 },
      overflow: 1,
    });
  });

  test("takes each weapon and artifact in as an entry of its own at its starting level", () => {
    expect.hasAssertions();

    const weapon = createDefinition(ItemCategory.Weapon, 0);
    const artifact = createDefinition(ItemCategory.Artifact, 1);
    const { inventory } = addInventoryItem(emptyInventory, weapon, 2);

    expect(addInventoryItem(inventory, artifact, 1)).toStrictEqual({
      inventory: {
        items: [
          { definition: weapon, id: 0, level: WEAPON_START_LEVEL, quantity: 1 },
          { definition: weapon, id: 1, level: WEAPON_START_LEVEL, quantity: 1 },
          { definition: artifact, id: 2, level: ARTIFACT_START_LEVEL, quantity: 1 },
        ],
        nextId: 3,
      },
      overflow: 0,
    });
  });

  test.each([ItemCategory.Weapon, ItemCategory.Furnishing])(
    "takes no more %s pieces than the tab's room",
    (category) => {
      expect.hasAssertions();

      const room = ItemCategoryRoomMap[category];
      assert.exists(room);
      const definition = createDefinition(category, 0, room);
      const { inventory } = addInventoryItem(emptyInventory, definition, room - 1);

      expect(addInventoryItem(inventory, definition, 2).overflow).toBe(1);
    },
  );

  test("opens no new kind once the bag holds its limit of kinds", () => {
    expect.hasAssertions();

    const items = Array.from({ length: INVENTORY_KIND_LIMIT }, (_value, index) => ({
      definition: createDefinition(ItemCategory.Material, index),
      id: index,
      quantity: 1,
    }));
    const inventory: Inventory = { items, nextId: INVENTORY_KIND_LIMIT };

    expect(addInventoryItem(inventory, createDefinition(ItemCategory.Material, INVENTORY_KIND_LIMIT), 1)).toStrictEqual(
      { inventory, overflow: 1 },
    );
  });
});
