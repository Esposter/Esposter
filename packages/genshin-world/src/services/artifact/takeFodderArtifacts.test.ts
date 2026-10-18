import type { Artifact } from "#src/models/artifact/Artifact";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { takeFodderArtifacts } from "#src/services/artifact/takeFodderArtifacts";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createArtifact = (isLocked: boolean): Artifact => ({
  experience: 0,
  isLocked,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(takeFodderArtifacts, () => {
  const flowerDefinition: ItemDefinition = {
    category: ItemCategory.Artifact,
    id: 101,
    name: "Flower Piece",
    rank: 1,
    rarity: 5,
    stackLimit: 1,
  };

  test("the fodders are taken out of the bag and returned as the artifacts they hold", () => {
    expect.hasAssertions();

    const fodder = createArtifact(false);
    const kept = createArtifact(false);
    expect(
      takeFodderArtifacts(
        {
          items: [
            { artifact: fodder, definition: flowerDefinition, id: 0, quantity: 1 },
            { artifact: kept, definition: flowerDefinition, id: 1, quantity: 1 },
          ],
          nextId: 2,
          quickSwapItemIds: [],
        },
        [0],
      ),
    ).toStrictEqual({
      fodders: [fodder],
      inventory: {
        items: [{ artifact: kept, definition: flowerDefinition, id: 1, quantity: 1 }],
        nextId: 2,
        quickSwapItemIds: [],
      },
    });
  });

  test("a locked artifact is refused as fodder", () => {
    expect.hasAssertions();

    expect(() =>
      takeFodderArtifacts(
        {
          items: [{ artifact: createArtifact(true), definition: flowerDefinition, id: 0, quantity: 1 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
        [0],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: takeFodderArtifacts, entry 0 is not an unlocked artifact]`,
    );
  });

  test("an entry that is not an artifact is refused as fodder", () => {
    expect.hasAssertions();

    expect(() =>
      takeFodderArtifacts(
        { items: [{ definition: flowerDefinition, id: 2, quantity: 3 }], nextId: 3, quickSwapItemIds: [] },
        [2],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: takeFodderArtifacts, entry 2 is not an unlocked artifact]`,
    );
  });
});
