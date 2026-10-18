import type { ActiveArtifactSetBonus } from "#src/models/artifact/ActiveArtifactSetBonus";
import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Every set bonus the artifacts a character wears reach: a set's bonus is active from the piece count it names, so four
// Pieces of a set reach its two piece bonus and its four piece bonus both. Each names the set it belongs to
export const getActiveArtifactSetBonuses = (
  artifacts: readonly Artifact[],
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>,
): ActiveArtifactSetBonus[] =>
  Array.from(
    Map.groupBy(artifacts, ({ setId }) => setId),
    ([setId, setArtifacts]) => {
      const artifactSetData = artifactSetDataMap.get(setId);
      if (!artifactSetData)
        throw new InvalidOperationError(Operation.Read, getActiveArtifactSetBonuses.name, `${setId}`);
      return artifactSetData.bonuses
        .filter(({ pieceCount }) => pieceCount <= setArtifacts.length)
        .map(({ attributeLines, descriptionTextHash, params, pieceCount }) => ({
          attributeLines,
          descriptionTextHash,
          params,
          pieceCount,
          setId,
        }));
    },
  ).flat();
