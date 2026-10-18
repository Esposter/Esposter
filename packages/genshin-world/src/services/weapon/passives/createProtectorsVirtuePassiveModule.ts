import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Protector's Virtue at its rank: the rank's HP is the table's line, which the passive does not repeat. Its ATK rises by the rank's
// Share of its Max HP as its attributes stand
export const createProtectorsVirtuePassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackShare = takeOne(params, 1);
  return {
    getPassiveBonuses: (combatant) => [
      { amount: attackShare * combatant.attributes.maxHealth, attribute: Attribute.Attack },
    ],
  };
};
