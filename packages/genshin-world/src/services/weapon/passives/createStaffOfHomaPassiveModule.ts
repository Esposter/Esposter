import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

const LOW_HEALTH_SHARE = 0.5;

// Staff of Homa at its rank: the wielder's HP rises by the rank's percentage, and its ATK by the rank's share of its Max HP,
// As its attributes stand before this passive's own HP, which rises by the third share too while its HP is under half
export const createStaffOfHomaPassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthPercent = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  const lowHealthAttackShare = takeOne(params, 2);
  return {
    getPassiveBonuses: (combatant, healthShare) => [
      { amount: healthPercent, attribute: Attribute.HealthPercent },
      {
        amount:
          (attackShare + (healthShare < LOW_HEALTH_SHARE ? lowHealthAttackShare : 0)) * combatant.attributes.maxHealth,
        attribute: Attribute.Attack,
      },
    ],
  };
};
