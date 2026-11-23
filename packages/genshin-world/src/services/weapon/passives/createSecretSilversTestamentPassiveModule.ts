import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// The Energy a burst may cost for the passive's second and third amounts, as its text's 60 and 40 give them
const SECOND_AMOUNT_MAXIMUM_ENERGY_COST = 60;
const THIRD_AMOUNT_MAXIMUM_ENERGY_COST = 40;

// Secret Silver's Testament at its rank: a static Elemental Burst DMG, raised by the rank's second amount while the
// Wielder's Burst costs no more than 60 Energy, and by its third amount while the burst costs no more than 40
export const createSecretSilversTestamentPassiveModule = (params: number[]): PassiveModule => {
  const staticDamageBonus = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (strike) => {
      if (strike.attackTag !== AttackTag.ElementalBurst) return 0;
      const { burstEnergyCost } = strike.combatant.kit;
      if (burstEnergyCost <= THIRD_AMOUNT_MAXIMUM_ENERGY_COST) return staticDamageBonus + takeOne(params, 2);
      if (burstEnergyCost <= SECOND_AMOUNT_MAXIMUM_ENERGY_COST) return staticDamageBonus + takeOne(params, 1);
      return staticDamageBonus;
    },
  };
};
