import type { Artifact } from "#src/models/artifact/Artifact";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { FLOWER_ITEM_DEFINITION } from "#src/services/artifact/constants.test";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { equipBagArtifact } from "#src/services/artifact/equipBagArtifact";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createEntry = (artifact: Artifact, id: number): InventoryItem => ({
  artifact,
  definition: FLOWER_ITEM_DEFINITION,
  id,
  quantity: 1,
});

describe(equipBagArtifact, () => {
  const options = {
    names: { "101": "Flower Piece" },
    reliquarySets: [
      {
        id: 1,
        nameTextId: "1",
        needCounts: [2, 4],
        pieces: [
          {
            itemId: 101,
            nameTextId: "101",
            rank: 1,
            rarity: 5,
            slot: ArtifactSlot.FlowerOfLife,
            startingMinorCount: 3,
          },
        ],
      },
    ] satisfies ReliquarySetData[],
  };

  test("the chosen piece is worn, and the piece it wore goes back to the bag as an entry of its own", () => {
    expect.hasAssertions();

    const worn = createArtifact();
    const chosen = createArtifact({ level: 4 });
    const other = createArtifact({ level: 2 });
    expect(
      equipBagArtifact(
        { items: [createEntry(chosen, 0), createEntry(other, 1)], nextId: 2, quickSwapItemIds: [] },
        createCharacter([worn]),
        0,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([chosen]),
      inventory: { items: [createEntry(other, 1), createEntry(worn, 2)], nextId: 3, quickSwapItemIds: [] },
    });
  });

  test("a slot with no piece worn takes the chosen piece without returning one", () => {
    expect.hasAssertions();

    const chosen = createArtifact({ level: 4 });
    expect(
      equipBagArtifact(
        { items: [createEntry(chosen, 0)], nextId: 1, quickSwapItemIds: [] },
        createCharacter([]),
        0,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([chosen]),
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
    });
  });

  test("an entry that holds no artifact is refused", () => {
    expect.hasAssertions();

    expect(() =>
      equipBagArtifact(
        {
          items: [{ definition: { ...FLOWER_ITEM_DEFINITION, category: ItemCategory.Material }, id: 0, quantity: 3 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
        createCharacter([]),
        0,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: equipBagArtifact, entry 0 is not an artifact]`,
    );
  });
});
