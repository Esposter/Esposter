import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Protector's Virtue at its rank: the wielder's HP rises by the rank's percentage.
// Its ATK rises by the rank's share of its Max HP.
// That share is converted from Max HP, and it is read from the Max HP the buffs and ordinary passives leave.
export const createProtectorsVirtuePassiveModule = (params: number[]): PassiveModule => {
  const healthPercent = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  return {
    getConversionBonuses: (combatant) => [
      { amount: attackShare * combatant.attributes.maxHealth, attribute: Attribute.Attack },
    ],
    getPassiveBonuses: () => [{ amount: healthPercent, attribute: Attribute.HealthPercent }],
  };
};
