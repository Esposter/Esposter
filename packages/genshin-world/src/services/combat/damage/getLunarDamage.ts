import type { LunarReactionType } from "#src/models/combat/LunarReactionType";

import { LUNAR_ELEMENTAL_MASTERY_CURVE } from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";
import { LunarReactionCoefficientMap } from "#src/services/combat/damage/LunarReactionCoefficientMap";

// Lunar damage before the target's RES and the CRIT hit: the reaction's coefficient of its base, the character's level
// Multiplier for a reaction's contribution or the talent's multiplier of its stat for a direct hit, raised by the Base
// DMG Bonus, and by the elemental mastery and reaction bonus. It ignores Defence and takes no DMG Bonus
export const getLunarDamage = (
  lunarReactionType: LunarReactionType,
  base: number,
  elementalMastery: number,
  baseDamageBonus: number,
  reactionBonus: number,
): number =>
  LunarReactionCoefficientMap[lunarReactionType] *
  base *
  (1 + baseDamageBonus) *
  (1 + getElementalMasteryBonus(elementalMastery, LUNAR_ELEMENTAL_MASTERY_CURVE) + reactionBonus);
