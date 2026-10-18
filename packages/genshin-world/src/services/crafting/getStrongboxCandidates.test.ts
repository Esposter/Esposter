import type { Artifact } from "#src/models/artifact/Artifact";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getStrongboxCandidates } from "#src/services/crafting/getStrongboxCandidates";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { describe, expect, test } from "vitest";

const PIECE_ITEM_ID = 100_000;
const PIECE: ReliquaryPieceEntry = {
  itemId: PIECE_ITEM_ID,
  nameTextId: "TEST_PIECE",
  rank: 10,
  rarity: 5,
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
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity,
  setId: PIECE.setId,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(getStrongboxCandidates, () => {
  test("the panel lists only the offerable artifacts", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [
      { artifact: createArtifact(5, false), definition, id: 0, quantity: 1 },
      { artifact: createArtifact(5, true), definition, id: 1, quantity: 1 },
      { artifact: createArtifact(4, false), definition, id: 2, quantity: 1 },
      { definition, id: 3, quantity: 1 },
    ];

    expect(getStrongboxCandidates(items, 5).map((item) => item.id)).toStrictEqual([0]);
  });
});
