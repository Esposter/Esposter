import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Protector's Virtue at its rank: the wielder's HP rises by the rank's percentage, and its ATK rises by the rank's share of
// Its Max HP as its attributes stand before this passive's own HP
export const createProtectorsVirtuePassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthPercent = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  return {
    getPassiveBonuses: (combatant) => [
      { amount: healthPercent, attribute: Attribute.HealthPercent },
      { amount: attackShare * combatant.attributes.maxHealth, attribute: Attribute.Attack },
    ],
  };
};
