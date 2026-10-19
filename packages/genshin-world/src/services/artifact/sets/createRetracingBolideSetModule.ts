import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsKitShielded } from "#src/services/kit/effects/checkIsKitShielded";
import { checkIsCharacterOnField } from "#src/services/party/checkIsCharacterOnField";
import { takeOne } from "@esposter/shared";

// Retracing Bolide's four-piece bonus: the Normal and Charged Attack DMG its wearer gains while a shield is live
// And the wearer is on the field, which is the character a shield takes a strike for, in the table's only param. A shield
// Protects the character on the field whoever cast it
export const createRetracingBolideSetModule = ({ params }: ArtifactSetBonus): PassiveModule => {
  const amount = takeOne(params, 0);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, deployedCombatants, effects) =>
      checkIsKitShielded(effects, checkIsCharacterOnField(deployedCombatants, characterId))
        ? [
            { amount, attribute: Attribute.NormalAttackDamageBonus },
            { amount, attribute: Attribute.ChargedAttackDamageBonus },
          ]
        : [],
  };
};
