import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { Kit } from "#src/models/kit/Kit";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ArtifactSetIdCreateModuleMap } from "#src/services/artifact/ArtifactSetIdCreateModuleMap";
import { WILDLIFE_ANSWERING_ARTIFACT_SET_IDS } from "#src/services/artifact/constants";
import { getActiveArtifactSetBonuses } from "#src/services/artifact/getActiveArtifactSetBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";

// A character's kit with the sets its artifacts make pricing and answering the events of combat after it: each bonus its
// Worn pieces reach that the set table gives numbers to, built as its set's module where the set has one. A character
// Whose sets build none keeps its kit as it is
export const getArtifactSetKit = (
  kit: Kit,
  artifacts: readonly Artifact[],
  artifactSetDataMap: ReadonlyMap<number, ArtifactSetData>,
): Kit => {
  // A set with no module builds nothing, so its data is not read for it: a set the table lacks throws only where it
  // Builds one
  const artifactSetModules = getActiveArtifactSetBonuses(
    artifacts.filter(({ setId }) => ArtifactSetIdCreateModuleMap[setId] !== undefined),
    artifactSetDataMap,
  ).flatMap((bonus) => {
    const createModule = ArtifactSetIdCreateModuleMap[bonus.setId];
    // A bonus that is only attributes is counted by the attribute pipeline, its params repeating its value, so it
    // Builds no module
    if (!createModule || bonus.params.length === 0 || bonus.attributeLines.length > 0) return [];
    return [
      { isWildlifeAnswering: WILDLIFE_ANSWERING_ARTIFACT_SET_IDS.includes(bonus.setId), module: createModule(bonus) },
    ];
  });
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
