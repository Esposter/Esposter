import type { LunarReactionType } from "#src/models/combat/LunarReactionType";

import { getLunarReactionDamage } from "#src/services/combat/damage/getLunarReactionDamage";
import { LunarReactionCoefficientMap } from "#src/services/combat/damage/LunarReactionCoefficientMap";

// A Lunar reaction's damage before the target's RES and the CRIT hit, its coefficient for the type
// As getLunarReactionDamage
export const getLunarDamage = (
  lunarReactionType: LunarReactionType,
  base: number,
  elementalMastery: number,
  baseDamageBonus: number,
  reactionBonus: number,
): number =>
  getLunarReactionDamage(
    LunarReactionCoefficientMap[lunarReactionType],
    base,
    elementalMastery,
    baseDamageBonus,
    reactionBonus,
  );
