import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { inventorySaveSchema } from "#src/models/inventory/InventorySave";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { toInventory } from "#src/services/save/toInventory";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { describe, expect, test } from "vitest";

// Made-up pieces and names, so the test reads no game data
const PIECE_ID = 90_101;
const names = { TEST_PIECE: "Test Piece" };
const reliquaryPieceEntryMap = new Map([
  [
    PIECE_ID,
    {
      itemId: PIECE_ID,
      nameTextId: "TEST_PIECE",
      rank: 1,
      rarity: 1,
      setId: 90_001,
      slot: ArtifactSlot.FlowerOfLife,
      startingMinorCount: 0,
    },
  ],
]);

describe(toInventory, () => {
  test("reads an artifact back as the artifact it was saved as", () => {
    expect.hasAssertions();

    const artifact: Artifact = {
      experience: 0,
      isLocked: false,
      level: 0,
      mainAffix: Attribute.Health,
      minorAffixes: [{ attribute: Attribute.Attack, value: 10 }],
      rarity: 1,
      setId: 90_001,
      slot: ArtifactSlot.FlowerOfLife,
    };
    const inventory: Inventory = {
      items: [
        {
          artifact,
          definition: getDroppedItemDefinition(PIECE_ID, names, new Map(), reliquaryPieceEntryMap),
          id: 0,
          quantity: 1,
        },
      ],
      nextId: 1,
    };

    expect(
      toInventory(
        inventorySaveSchema.parse(toInventorySave(inventory)),
        names,
        new Map(),
        new Map(),
        reliquaryPieceEntryMap,
      ),
    ).toStrictEqual(inventory);
  });

  test("refuses an artifact entry saved before it held its rolled artifact", () => {
    expect.hasAssertions();

    expect(
      inventoryItemSaveSchema.safeParse({
        id: 0,
        itemId: PIECE_ID,
        kind: InventoryItemKind.Artifact,
        level: 0,
        quantity: 1,
      }).success,
    ).toBe(false);
  });
});
