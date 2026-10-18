import type { Artifact } from "#src/models/artifact/Artifact";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { toggleInventoryArtifactLock } from "#src/services/inventory/toggleInventoryArtifactLock";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createArtifact = (): Artifact => ({
  experience: 0,
  isLocked: false,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(toggleInventoryArtifactLock, () => {
  const flowerDefinition: ItemDefinition = {
    category: ItemCategory.Artifact,
    id: 101,
    name: "Flower Piece",
    rank: 1,
    rarity: 5,
    stackLimit: 1,
  };

  test("toggling a bag artifact locks it, and toggling it again unlocks it", () => {
    expect.hasAssertions();

    const artifact = createArtifact();
    const inventory = {
      items: [{ artifact, definition: flowerDefinition, id: 0, quantity: 1 }],
      nextId: 1,
      quickSwapItemIds: [],
    };
    const locked = toggleInventoryArtifactLock(inventory, 0);
    expect(locked).toStrictEqual({
      ...inventory,
      items: [{ artifact: { ...artifact, isLocked: true }, definition: flowerDefinition, id: 0, quantity: 1 }],
    });
    expect(toggleInventoryArtifactLock(locked, 0)).toStrictEqual(inventory);
  });

  test("an entry that is not an artifact is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toggleInventoryArtifactLock(
        { items: [{ definition: flowerDefinition, id: 2, quantity: 3 }], nextId: 3, quickSwapItemIds: [] },
        2,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: toggleInventoryArtifactLock, entry 2 is not an artifact]`,
    );
  });
});
