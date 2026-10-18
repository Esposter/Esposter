import type { TreeArtifact } from "#src/models/domains/TreeArtifact";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { drawArtifactPiece } from "#src/services/artifact/drawArtifactPiece";
import { rollPieceArtifact } from "#src/services/artifact/rollPieceArtifact";
import { drawChancedCount } from "#src/services/reward/drawChancedCount";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The artifacts one claim of a Domain of Blessing's tree draws: each row's count drawn by its guaranteed count and chance,
// And each artifact of that count rolled as a drop is, from one of the domain's sets drawn evenly, in a slot drawn evenly,
// At the row's rarity. Each artifact is returned apart, so each stays its own in the bag. A domain with artifact rows and no
// Set of its own to draw from is refused rather than paid with none
export const drawDomainArtifacts = (
  treeArtifacts: readonly TreeArtifact[],
  artifactSetIds: readonly number[],
  reliquarySets: readonly ReliquarySetData[],
  random: () => number,
  tables: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem[] => {
  const sets = reliquarySets.filter(({ id }) => artifactSetIds.includes(id));
  if (sets.length === 0 && treeArtifacts.length > 0)
    throw new InvalidOperationError(Operation.Read, drawDomainArtifacts.name, "has no artifact set to draw from");
  return treeArtifacts.flatMap((treeArtifact) =>
    Array.from({ length: drawChancedCount(treeArtifact, random) }, () => {
      const set = takeOne(sets, Math.floor(random() * sets.length));
      const slots = Object.values(ArtifactSlot);
      const slot = takeOne(slots, Math.floor(random() * slots.length));
      return rollPieceArtifact(set.id, drawArtifactPiece(set, slot, treeArtifact.rarity, random), random, tables);
    }),
  );
};
