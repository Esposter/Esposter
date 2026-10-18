import type { LunarReactionType } from "#src/models/combat/LunarReactionType";

import { getReactionDamage } from "#src/services/combat/damage/getReactionDamage";
import { LunarReactionCoefficientMap } from "#src/services/combat/damage/LunarReactionCoefficientMap";

// A Lunar reaction's damage before the target's RES and the CRIT hit, its coefficient for the type, as getReactionDamage
export const getLunarDamage = (
  lunarReactionType: LunarReactionType,
  base: number,
  elementalMastery: number,
  baseDamageBonus: number,
  reactionBonus: number,
): number =>
  getReactionDamage(
    LunarReactionCoefficientMap[lunarReactionType],
    base,
    elementalMastery,
    baseDamageBonus,
    reactionBonus,
  );
