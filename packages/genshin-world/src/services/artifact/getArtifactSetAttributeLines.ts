import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { AttributeLine } from "#src/models/character/AttributeLine";

import { getActiveArtifactSetBonuses } from "#src/services/artifact/getActiveArtifactSetBonuses";

// What a character's artifacts earn by their sets: every bonus of each set whose piece count the character wears at
// Least, so four of a set earn its two piece bonus and its four piece bonus both
export const getArtifactSetAttributeLines = (
  artifacts: readonly Artifact[],
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>,
): AttributeLine[] =>
  getActiveArtifactSetBonuses(artifacts, artifactSetDataMap).flatMap(({ attributeLines }) => attributeLines);
