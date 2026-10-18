import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { takeOne } from "@esposter/shared";

// The set table's id 15015's four-piece bonus: the Normal and Charged Attack DMG its wearer gains while a shield is live
// And the wearer is on the field, which is the character a shield takes a strike for, in the table's only param. A shield
// Protects the character on the field whoever cast it
export const createArtifactSet15015Module = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const amount = takeOne(params, 0);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants, effects) =>
      deployedCombatants.some(({ characterId, isOnField }) => isOnField && characterId === combatant.characterId) &&
      effects.some(checkIsKitShieldLive)
        ? [
            { amount, attribute: Attribute.NormalAttackDamageBonus },
            { amount, attribute: Attribute.ChargedAttackDamageBonus },
          ]
        : [],
  };
};
