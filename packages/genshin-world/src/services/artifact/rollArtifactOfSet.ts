import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { rollArtifact } from "#src/services/artifact/rollArtifact";
import { CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS } from "#src/services/chest/constants";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One artifact of a set, in a slot and at a star count, rolled as the game drops one: its starting minor affix count by the
// Wiki's distribution for those stars, the piece the reliquary tables hold for all four, and the artifact's stats rolled from
// Its slot's main affix pool and its stars' rarity data. The distribution is the one a domain drops, so it is provisional too
export const rollArtifactOfSet = (
  set: ReliquarySetData,
  slot: ArtifactSlot,
  rarity: number,
  random: () => number,
  {
    artifactMainAffixPools,
    artifactRarityDataMap,
  }: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem => {
  const minorAffixCountWeights = CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS[rarity];
  if (minorAffixCountWeights === undefined)
    throw new InvalidOperationError(Operation.Read, rollArtifactOfSet.name, `no minor affix count for ${rarity} stars`);
  const minorAffixCount = drawWeightedValue(minorAffixCountWeights, random);
  const piece = set.pieces.find(
    (candidate) =>
      candidate.slot === slot && candidate.rarity === rarity && candidate.startingMinorCount === minorAffixCount,
  );
  if (piece === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      String(set.id),
      `holds no ${slot} piece of ${rarity} stars with ${minorAffixCount} minor affixes`,
    );
  const mainAffixPool = artifactMainAffixPools.find((pool) => pool.slot === slot);
  if (mainAffixPool === undefined)
    throw new InvalidOperationError(Operation.Read, rollArtifactOfSet.name, `no main affix pool for ${slot}`);
  const artifact = rollArtifact({
    mainAffixPool,
    minorAffixCount,
    random,
    rarityData: getArtifactRarityData(artifactRarityDataMap, rarity),
    setId: set.id,
  });
  return { artifact, count: 1, itemId: piece.itemId };
};
