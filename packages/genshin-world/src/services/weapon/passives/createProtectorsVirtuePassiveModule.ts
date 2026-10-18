import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Protector's Virtue at its rank: the wielder's HP rises by the rank's percentage, and its ATK rises by the rank's share
// Of its Max HP, a stat converted from Max HP that is read from the Max HP the buffs and ordinary passives leave it
export const createProtectorsVirtuePassiveModule = (params: number[]): WeaponPassiveModule => {
  const healthPercent = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  return {
    getConversionBonuses: (combatant) => [
      { amount: attackShare * combatant.attributes.maxHealth, attribute: Attribute.Attack },
    ],
    getPassiveBonuses: () => [{ amount: healthPercent, attribute: Attribute.HealthPercent }],
  };
};
