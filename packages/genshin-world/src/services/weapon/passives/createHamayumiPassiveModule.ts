import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Hamayumi at its rank: its wielder's normal and charged attacks deal the rank's bonuses, and while the wielder's Energy is
// Full each hit of those attacks gains its bonus again, as the rank's third number raises it. Read as each hit strikes
export const createHamayumiPassiveModule = (params: number[]): WeaponPassiveModule => {
  const normalAttackDamageBonus = takeOne(params, 0);
  const chargedAttackDamageBonus = takeOne(params, 1);
  const fullEnergyIncrease = takeOne(params, 2);
  return {
    getPassiveBonuses: () => [
      { amount: normalAttackDamageBonus, attribute: Attribute.NormalAttackDamageBonus },
      { amount: chargedAttackDamageBonus, attribute: Attribute.ChargedAttackDamageBonus },
    ],
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, party) => {
      if (getPartyMember(party, combatant.characterId).energy < combatant.kit.burstEnergyCost) return 0;
      if (attackTag === AttackTag.NormalAttack) return normalAttackDamageBonus * fullEnergyIncrease;
      if (attackTag === AttackTag.ChargedAttack) return chargedAttackDamageBonus * fullEnergyIncrease;
      return 0;
    },
  };
};
