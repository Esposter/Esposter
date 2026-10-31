import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { FLOWER_ITEM_DEFINITION } from "#src/services/artifact/constants.test";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getBagArtifactsForSlot } from "#src/services/artifact/getBagArtifactsForSlot";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createEntry = (id: number, artifact: Artifact): InventoryItem => ({
  artifact,
  definition: FLOWER_ITEM_DEFINITION,
  id,
  quantity: 1,
});

describe(getBagArtifactsForSlot, () => {
  test("the slot's artifacts come the highest rarity first, then the highest level", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [
        createEntry(0, createArtifact({ level: 8, rarity: 4, slot: ArtifactSlot.FlowerOfLife })),
        createEntry(1, createArtifact({ level: 0, rarity: 5, slot: ArtifactSlot.FlowerOfLife })),
        createEntry(2, createArtifact({ level: 12, rarity: 4, slot: ArtifactSlot.FlowerOfLife })),
        createEntry(3, createArtifact({ level: 4, rarity: 5, slot: ArtifactSlot.PlumeOfDeath })),
        {
          definition: {
            category: ItemCategory.Material,
            id: 105_002,
            name: "Sanctifying Unction",
            rank: 6,
            rarity: 3,
            stackLimit: 99_999,
          },
          id: 4,
          quantity: 3,
        },
      ],
      nextId: 5,
      quickSwapItemIds: [],
    };
    expect(getBagArtifactsForSlot(inventory, ArtifactSlot.FlowerOfLife).map(({ id }) => id)).toStrictEqual([1, 2, 0]);
  });

  test("a slot the bag holds no artifact for lists nothing", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [createEntry(0, createArtifact({ level: 0, rarity: 5, slot: ArtifactSlot.PlumeOfDeath }))],
      nextId: 1,
      quickSwapItemIds: [],
    };
    expect(getBagArtifactsForSlot(inventory, ArtifactSlot.FlowerOfLife)).toStrictEqual([]);
  });
});
