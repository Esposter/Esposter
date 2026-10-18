import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { ElementResistanceAttributeMap } from "#src/services/combat/damage/ElementResistanceAttributeMap";
import { takeOne } from "@esposter/shared";

// Defender's Will's four-piece bonus: the Elemental RES its wearer gains to each different element its team holds,
// At the amount in the table's only param, so one element counts once however many members draw in it
export const createDefendersWillSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const amount = takeOne(params, 0);
  return {
    getPassiveBonuses: (combatant) =>
      [...new Set(combatant.deployedElements)].flatMap((element) =>
        element === undefined ? [] : [{ amount, attribute: ElementResistanceAttributeMap[element] }],
      ),
  };
};
