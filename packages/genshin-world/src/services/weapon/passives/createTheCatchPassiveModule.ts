import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// The Catch at its rank: its Elemental Burst DMG and Elemental Burst CRIT Rate, each a static line its wielder's bursts
// Are Priced with, as its passive's text gives them and its table's rows do not carry them
export const createTheCatchPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const criticalRate = takeOne(params, 1);
  return {
    getStrikeCriticalRateBonus: (strike) => (strike.attackTag === AttackTag.ElementalBurst ? criticalRate : 0),
    getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0),
  };
};
