import type { Artifact } from "#src/models/artifact/Artifact";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { canOfferForStrongbox } from "#src/services/crafting/canOfferForStrongbox";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { describe, expect, test } from "vitest";

const STRONGBOX_RARITY = 5;
const PIECE_ITEM_ID = 100_000;
const PIECE: ReliquaryPieceEntry = {
  itemId: PIECE_ITEM_ID,
  nameTextId: "TEST_PIECE",
  rank: 10,
  rarity: STRONGBOX_RARITY,
  setId: 10_030,
  slot: ArtifactSlot.FlowerOfLife,
  startingMinorCount: 3,
};
const definition = getDroppedItemDefinition(
  PIECE_ITEM_ID,
  { TEST_PIECE: "Test Piece" },
  new Map(),
  new Map(),
  new Map([[PIECE_ITEM_ID, PIECE]]),
);
const createArtifact = (rarity: number, isLocked: boolean): Artifact => ({
  experience: 0,
  isLocked,
  itemId: PIECE_ITEM_ID,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity,
  setId: PIECE.setId,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(canOfferForStrongbox, () => {
  test("only an unlocked artifact of the strongbox's star rank can be offered", () => {
    expect.hasAssertions();

    const items: (InventoryItem | undefined)[] = [
      { artifact: createArtifact(STRONGBOX_RARITY, false), definition, id: 0, quantity: 1 },
      { artifact: createArtifact(STRONGBOX_RARITY, true), definition, id: 1, quantity: 1 },
      { artifact: createArtifact(STRONGBOX_RARITY - 1, false), definition, id: 2, quantity: 1 },
      { definition, id: 3, quantity: 1 },
      undefined,
    ];

    expect(items.map((item) => canOfferForStrongbox(item, STRONGBOX_RARITY))).toStrictEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
  });
});
