import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The value an artifact's main affix raises its attribute by, at its rarity's curve and its enhancement level. A rarity the
// Curves hold no level for the attribute at is refused
export const getArtifactMainAffixValue = (
  artifact: Artifact,
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[],
): number => {
  const value = artifactMainAffixCurves.find(
    ({ attribute, rarity }) => attribute === artifact.mainAffix && rarity === artifact.rarity,
  )?.values[artifact.level];
  if (value === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      getArtifactMainAffixValue.name,
      `${artifact.mainAffix} at rarity ${artifact.rarity}`,
    );
  return value;
};
