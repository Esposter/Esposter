import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { createChanceProcPassiveModule } from "#src/services/weapon/passives/createChanceProcPassiveModule";
import { takeOne } from "@esposter/shared";

const OCEANIC_VICTORY_COOLDOWN_ID = "oceanicVictoryCooldown";

// Oceanic Victory at its rank: its wielder's Elemental Burst DMG is raised by the rank's percentage, and an Elemental Burst
// Hit has the rank's chance of an extra hit at the rank's multiplier of ATK, once every the rank's cooldown in seconds
export const createOceanicVictoryPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    ...createChanceProcPassiveModule({
      chance: takeOne(params, 1),
      checkIsProcAttack: (attackTag) => attackTag === AttackTag.ElementalBurst,
      cooldownId: OCEANIC_VICTORY_COOLDOWN_ID,
      cooldownSeconds: takeOne(params, 3),
      talentMultiplier: takeOne(params, 2),
    }),
    getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0),
  };
};
