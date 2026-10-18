import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { Kit } from "#src/models/kit/Kit";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ArtifactSetIdCreateModuleMap } from "#src/services/artifact/ArtifactSetIdCreateModuleMap";
import { WILDLIFE_ANSWERING_ARTIFACT_SET_IDS } from "#src/services/artifact/constants";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's kit with the sets its artifacts make pricing and answering the events of combat after it: each bonus its
// Worn pieces reach that the set table gives numbers to, built as its set's module where the set has one. A character
// Whose sets build none keeps its kit as it is
export const getArtifactSetKit = (
  kit: Kit,
  artifacts: readonly Artifact[],
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>,
): Kit => {
  const artifactSetModules = Array.from(
    Map.groupBy(artifacts, ({ setId }) => setId),
    ([setId, setArtifacts]) => {
      const createModule = ArtifactSetIdCreateModuleMap[setId];
      if (!createModule) return [];
      const artifactSetData = artifactSetDataMap.get(setId);
      if (!artifactSetData) throw new InvalidOperationError(Operation.Read, getArtifactSetKit.name, `${setId}`);
      // A bonus that is only attributes is counted by the attribute pipeline, its params repeating its value, so it builds no module
      return artifactSetData.bonuses
        .filter(
          ({ attributeLines, params, pieceCount }) =>
            params.length > 0 && attributeLines.length === 0 && pieceCount <= setArtifacts.length,
        )
        .map((bonus) => ({
          isWildlifeAnswering: WILDLIFE_ANSWERING_ARTIFACT_SET_IDS.includes(setId),
          module: createModule(bonus),
        }));
    },
  ).flat();
  if (artifactSetModules.length === 0) return kit;
  // A hit on wildlife triggers a weapon's passive, and an artifact set's only where it is one of those sets; the rest hear none of it
  const wildlifeKit = getPassiveKit(
    kit,
    artifactSetModules.filter(({ isWildlifeAnswering }) => isWildlifeAnswering).map(({ module }) => module),
  );
  return getPassiveKit(
    wildlifeKit,
    artifactSetModules.filter(({ isWildlifeAnswering }) => !isWildlifeAnswering).map(({ module }) => module),
    ({ kind }) => kind !== KitEventKind.WildlifeStruck,
  );
};
