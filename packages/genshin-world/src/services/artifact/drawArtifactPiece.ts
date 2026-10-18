import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS } from "#src/services/chest/constants";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The piece of a set an artifact in a slot at a star count is rolled from, drawn as the game drops one: its starting minor
// Affix count by the wiki's distribution for those stars, then the piece the reliquary tables hold for all four. The
// Distribution is the one a domain drops, so it is provisional too
export const drawArtifactPiece = (
  set: ReliquarySetData,
  slot: ArtifactSlot,
  rarity: number,
  random: () => number,
): ReliquaryPieceData => {
  const minorAffixCountWeights = CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS[rarity];
  if (minorAffixCountWeights === undefined)
    throw new InvalidOperationError(Operation.Read, drawArtifactPiece.name, `no minor affix count for ${rarity} stars`);
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
  return piece;
};
