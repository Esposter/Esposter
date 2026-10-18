import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { addInventoryArtifact } from "#src/services/inventory/addInventoryArtifact";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ItemCategory } from "genshin-interface";
import { assert, describe, expect, test } from "vitest";

const definition: ItemDefinition = {
  category: ItemCategory.Artifact,
  id: 90_001,
  name: "",
  rank: 0,
  rarity: 1,
  stackLimit: 1,
};
const artifact: Artifact = {
  experience: 0,
  isLocked: false,
  itemId: 101,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [{ attribute: Attribute.Attack, value: 10 }],
  rarity: 1,
  setId: 90_001,
  slot: ArtifactSlot.FlowerOfLife,
};

describe(addInventoryArtifact, () => {
  const emptyInventory: Inventory = { items: [], nextId: 0, quickSwapItemIds: [] };

  test("takes each artifact in as an entry of its own holding the artifact it was rolled as", () => {
    expect.hasAssertions();

    const otherArtifact: Artifact = { ...artifact, level: 4 };
    const { inventory } = addInventoryArtifact(emptyInventory, definition, artifact);

    expect(addInventoryArtifact(inventory, definition, otherArtifact)).toStrictEqual({
      inventory: {
        items: [
          { artifact, definition, id: 0, quantity: 1 },
          { artifact: otherArtifact, definition, id: 1, quantity: 1 },
        ],
        nextId: 2,
        quickSwapItemIds: [],
      },
      overflow: 0,
    });
  });

  test("keeps the equipped gadget in the bag it takes an artifact into", () => {
    expect.hasAssertions();

    const { inventory } = addInventoryArtifact({ ...emptyInventory, equippedGadgetItemId: 1 }, definition, artifact);

    expect(inventory.equippedGadgetItemId).toBe(1);
  });

  test("leaves the artifact over once the artifacts tab is full", () => {
    expect.hasAssertions();

    const room = ItemCategoryRoomMap[ItemCategory.Artifact];
    assert.exists(room);
    const items = Array.from({ length: room }, (_value, index) => ({ artifact, definition, id: index, quantity: 1 }));

    expect(addInventoryArtifact({ items, nextId: room, quickSwapItemIds: [] }, definition, artifact)).toStrictEqual({
      inventory: { items, nextId: room, quickSwapItemIds: [] },
      overflow: 1,
    });
  });

  test("keeps the equipped gadget in the bag that has no room for the artifact", () => {
    expect.hasAssertions();

    const room = ItemCategoryRoomMap[ItemCategory.Artifact];
    assert.exists(room);
    const items = Array.from({ length: room }, (_value, index) => ({ artifact, definition, id: index, quantity: 1 }));
    const { inventory } = addInventoryArtifact(
      { equippedGadgetItemId: 1, items, nextId: room, quickSwapItemIds: [] },
      definition,
      artifact,
    );

    expect(inventory.equippedGadgetItemId).toBe(1);
  });
});
