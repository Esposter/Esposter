import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

const LOW_HEALTH_SHARE = 0.5;

// Staff of Homa at its rank: the wielder's HP rises by the rank's percentage, and its ATK by the rank's share of its Max HP,
// Which rises by the rank's third share too while its HP is under half. The ATK is a stat converted from Max HP, read from
// The Max HP the buffs and ordinary passives leave the wielder, in the conversion phase
export const createStaffOfHomaPassiveModule = (params: number[]): PassiveModule => {
  const healthPercent = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  const lowHealthAttackShare = takeOne(params, 2);
  return {
    getConversionBonuses: (combatant, healthShare) => [
      {
        amount:
          (attackShare + (healthShare < LOW_HEALTH_SHARE ? lowHealthAttackShare : 0)) * combatant.attributes.maxHealth,
        attribute: Attribute.Attack,
      },
    ],
    getPassiveBonuses: () => [{ amount: healthPercent, attribute: Attribute.HealthPercent }],
  };
};
