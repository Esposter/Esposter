import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { AttributeLine } from "#src/models/character/AttributeLine";

import { InvalidOperationError, Operation } from "@esposter/shared";

// What a character's artifacts earn by their sets: every bonus of each set whose piece count the character wears at
// Least, so four of a set earn its two piece bonus and its four piece bonus both
export const getArtifactSetAttributeLines = (
  artifacts: readonly Artifact[],
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>,
): AttributeLine[] => {
  const setIdArtifactsMap = Map.groupBy(artifacts, ({ setId }) => setId);
  return Array.from(setIdArtifactsMap, ([setId, setArtifacts]) => {
    const artifactSetData = artifactSetDataMap.get(setId);
    if (!artifactSetData)
      throw new InvalidOperationError(Operation.Read, getArtifactSetAttributeLines.name, `${setId}`);
    return artifactSetData.bonuses
      .filter(({ pieceCount }) => pieceCount <= setArtifacts.length)
      .flatMap(({ attributeLines }) => attributeLines);
  }).flat();
};
