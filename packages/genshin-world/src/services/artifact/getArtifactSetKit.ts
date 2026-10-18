import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";
import type { Kit } from "#src/models/kit/Kit";

import { ArtifactSetIdCreateModuleMap } from "#src/services/artifact/ArtifactSetIdCreateModuleMap";
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
      return artifactSetData.bonuses
        .filter(({ params, pieceCount }) => params.length > 0 && pieceCount <= setArtifacts.length)
        .map((bonus) => createModule(bonus));
    },
  ).flat();
  if (artifactSetModules.length === 0) return kit;
  // The kit's own passives first, then each module's
  const passives = [kit, ...artifactSetModules];
  return {
    ...kit,
    getPassiveBonuses: (combatant, healthShare, deployedCombatants) =>
      passives.flatMap(
        ({ getPassiveBonuses }) => getPassiveBonuses?.(combatant, healthShare, deployedCombatants) ?? [],
      ),
    onKitEvent: (event, context, combatant) => {
      for (const { onKitEvent } of passives) onKitEvent?.(event, context, combatant);
    },
  };
};
