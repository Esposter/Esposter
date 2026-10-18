import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";

import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { rollArtifact } from "#src/services/artifact/rollArtifact";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The artifact a piece of a set is rolled as when it drops: its stats roll from its slot's main affix pool and its rarity's
// Data, with the piece's starting minor affixes, and the piece's item id names it
export const rollPieceArtifact = (
  setId: number,
  piece: ReliquaryPieceData,
  random: () => number,
  {
    artifactMainAffixPools,
    artifactRarityDataMap,
  }: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem => {
  const mainAffixPool = artifactMainAffixPools.find((pool) => pool.slot === piece.slot);
  if (mainAffixPool === undefined)
    throw new InvalidOperationError(Operation.Read, rollPieceArtifact.name, `no main affix pool for ${piece.slot}`);
  const artifact = rollArtifact({
    mainAffixPool,
    minorAffixCount: piece.startingMinorCount,
    random,
    rarityData: getArtifactRarityData(artifactRarityDataMap, piece.rarity),
    setId,
  });
  return { artifact, count: 1, itemId: piece.itemId };
};
