import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { takeOne } from "@esposter/shared";

// Redhorn Stonethresher at its rank: DEF rises by the rank's percentage, and each Normal or Charged Attack hit deals the
// Rank's share of DEF as base damage. The share is the wielder's DEF with its buffs on, as a hit reads it
export const createGokadaiouOtogibanashiPassiveModule = (params: number[]): WeaponPassiveModule => {
  const defensePercent = takeOne(params, 0);
  const damageShare = takeOne(params, 1);
  return {
    getPassiveBonuses: () => [{ amount: defensePercent, attribute: Attribute.DefensePercent }],
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (!checkIsNormalOrChargedAttack(strike.attackTag)) return 0;
      return (
        damageShare * getBuffedCombatant(strike.combatant, effects, party, characterIdCombatantMap).attributes.defense
      );
    },
  };
};
