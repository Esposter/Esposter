import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { takeOne } from "@esposter/shared";

// Redhorn Stonethresher at its rank: each Normal or Charged Attack hit its wielder deals adds the rank's share of DEF as base
// Damage. The share is the wielder's DEF with its buffs on, as a hit reads it. The rank's DEF line is a table line the
// Weapon carries whatever its conditions, so this passive does not repeat it
export const createGokadaiouOtogibanashiPassiveModule = (params: number[]): PassiveModule => {
  const damageShare = takeOne(params, 1);
  return {
    getStrikeAdditiveBaseDamageBonus: (strike) => {
      if (!checkIsNormalOrChargedAttack(strike.attackTag)) return 0;
      return damageShare * strike.combatant.attributes.defense;
    },
  };
};
