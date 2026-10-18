import { LUNAR_ELEMENTAL_MASTERY_CURVE } from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";

// A reaction's damage before the target's RES and the CRIT hit: its coefficient of the base, the character's level
// Multiplier for a reaction's contribution or the talent's multiplier of its stat for a direct hit, raised by the Base
// DMG Bonus, and by the elemental mastery and reaction bonus. It ignores Defence and takes no DMG Bonus
export const getReactionDamage = (
  coefficient: number,
  base: number,
  elementalMastery: number,
  baseDamageBonus: number,
  reactionBonus: number,
): number =>
  coefficient *
  base *
  (1 + baseDamageBonus) *
  (1 + getElementalMasteryBonus(elementalMastery, LUNAR_ELEMENTAL_MASTERY_CURVE) + reactionBonus);
