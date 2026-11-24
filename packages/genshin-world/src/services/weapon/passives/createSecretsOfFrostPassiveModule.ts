import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { RADIANCE_STELLAR_CONDUCT_STATUS_ID } from "#src/services/kit/constants";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

// The most Cryo or Electro members the text counts in Radiance
const RADIANCE_MAXIMUM_MEMBERS = 4;

// Secrets of Frost (Winter's Heavy Heart) at its rank: each Cryo member of the party, the wielder counted, adds the
// Rank's Elemental Mastery and each Electro member the rank's ATK percentage. In Radiance, read as the status the
// Polestar Field gives its members, each Cryo or Electro member adds the Radiance Elemental Mastery and Stellar Glimmer
// DMG instead, with no ATK, up to four of them
export const createSecretsOfFrostPassiveModule = (params: number[]): PassiveModule => {
  const elementalMasteryPerCryo = takeOne(params, 0);
  const attackPercentPerElectro = takeOne(params, 1);
  const radianceElementalMasteryPerMember = takeOne(params, 2);
  const radianceStellarGlimmerPerMember = takeOne(params, 3);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, deployedCombatants, effects) => {
      const cryoCount = deployedCombatants.filter((member) => member.element === Element.Cryo).length;
      const electroCount = deployedCombatants.filter((member) => member.element === Element.Electro).length;
      if (checkIsKitStatusActive(effects, characterId, RADIANCE_STELLAR_CONDUCT_STATUS_ID)) {
        const radianceCount = Math.min(cryoCount + electroCount, RADIANCE_MAXIMUM_MEMBERS);
        return [
          { amount: radianceElementalMasteryPerMember * radianceCount, attribute: Attribute.ElementalMastery },
          {
            amount: radianceStellarGlimmerPerMember * radianceCount,
            attribute: Attribute.StellarGlimmerReactionDamageBonus,
          },
        ];
      }
      return [
        { amount: elementalMasteryPerCryo * cryoCount, attribute: Attribute.ElementalMastery },
        { amount: attackPercentPerElectro * electroCount, attribute: Attribute.AttackPercent },
      ];
    },
  };
};
