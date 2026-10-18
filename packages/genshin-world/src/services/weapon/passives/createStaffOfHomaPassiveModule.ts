import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

const LOW_HEALTH_SHARE = 0.5;

// Staff of Homa at its rank: the rank's HP is the table's line, which the passive does not repeat. Its ATK is the rank's share of its
// Max HP as its attributes stand, which rises by the third share too while its HP is under half
export const createStaffOfHomaPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackShare = takeOne(params, 1);
  const lowHealthAttackShare = takeOne(params, 2);
  return {
    getPassiveBonuses: (combatant, memberState) => [
      {
        amount:
          (attackShare + (memberState.healthShare < LOW_HEALTH_SHARE ? lowHealthAttackShare : 0)) *
          combatant.attributes.maxHealth,
        attribute: Attribute.Attack,
      },
    ],
  };
};
