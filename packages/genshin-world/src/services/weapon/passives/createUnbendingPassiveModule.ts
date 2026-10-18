import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Unbending at its rank: while its wielder's HP is below the rank's share, its charged attacks deal the rank's extra DMG.
// The interruption resistance its text names is not modelled here, so only the damage part is built
export const createUnbendingPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthShare = takeOne(params, 0);
  const damageBonus = takeOne(params, 1);
  return {
    getStrikeDamageBonus: (strike, _enemy, party) =>
      strike.attackTag === AttackTag.ChargedAttack &&
      getPartyMember(party, strike.combatant.characterId).healthShare < healthShare
        ? damageBonus
        : 0,
  };
};
