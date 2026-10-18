import type { Artifact } from "#src/models/artifact/Artifact";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { Inventory } from "#src/models/inventory/Inventory";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getBagArtifactsForSlot } from "#src/services/artifact/getBagArtifactsForSlot";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createArtifact = (rarity: number, level: number, slot: ArtifactSlot): Artifact => ({
  experience: 0,
  isLocked: false,
  level,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity,
  setId: 1,
  slot,
});

const createEntry = (id: number, artifact: Artifact): InventoryItem => ({
  artifact,
  definition: { category: ItemCategory.Artifact, id: 101, name: "Flower Piece", rank: 1, rarity: 5, stackLimit: 1 },
  id,
  quantity: 1,
});

describe(getBagArtifactsForSlot, () => {
  test("the slot's artifacts come the highest rarity first, then the highest level", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [
        createEntry(0, createArtifact(4, 8, ArtifactSlot.FlowerOfLife)),
        createEntry(1, createArtifact(5, 0, ArtifactSlot.FlowerOfLife)),
        createEntry(2, createArtifact(4, 12, ArtifactSlot.FlowerOfLife)),
        createEntry(3, createArtifact(5, 4, ArtifactSlot.PlumeOfDeath)),
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
      items: [createEntry(0, createArtifact(5, 0, ArtifactSlot.PlumeOfDeath))],
      nextId: 1,
      quickSwapItemIds: [],
    };
    expect(getBagArtifactsForSlot(inventory, ArtifactSlot.FlowerOfLife)).toStrictEqual([]);
  });
});
