import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";

import { rollPieceArtifact } from "#src/services/artifact/rollPieceArtifact";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The artifact a strongbox holds, rolled as a drop of its set: one of the strongbox's pieces at its star rank, drawn evenly
// Among those it lists, since the wiki gives no odds for the piece within the set
export const rollStrongboxArtifact = (
  strongbox: CraftingStrongboxData,
  random: () => number,
  { artifactMainAffixPools, artifactRarityDataMap, reliquarySets }: ArtifactDropTables,
): DroppedItem => {
  const set = reliquarySets.find((candidate) => candidate.id === strongbox.id);
  if (set === undefined) throw new InvalidOperationError(Operation.Read, String(strongbox.id), "has no reliquary set");
  const pieces = set.pieces.filter(
    (piece) => piece.rarity === strongbox.rarity && strongbox.pieceItemIds.includes(piece.itemId),
  );
  if (pieces.length === 0)
    throw new InvalidOperationError(Operation.Read, String(strongbox.id), "holds no piece of its set");
  const piece = takeOne(pieces, Math.floor(random() * pieces.length));
  return rollPieceArtifact(set.id, piece, random, { artifactMainAffixPools, artifactRarityDataMap });
};
