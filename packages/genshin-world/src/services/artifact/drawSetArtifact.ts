import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { drawArtifactPiece } from "#src/services/artifact/drawArtifactPiece";
import { rollPieceArtifact } from "#src/services/artifact/rollPieceArtifact";
import { takeOne } from "@esposter/shared";

// One artifact of a set as a drop rolls it: its slot drawn evenly among the five, then its piece at the rarity given (see
// drawArtifactPiece), and the artifact rolled at that piece
export const drawSetArtifact = (
  set: ReliquarySetData,
  rarity: number,
  random: () => number,
  tables: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem => {
  const slots = Object.values(ArtifactSlot);
  const slot = takeOne(slots, Math.floor(random() * slots.length));
  return rollPieceArtifact(set.id, drawArtifactPiece(set, slot, rarity, random), random, tables);
};
