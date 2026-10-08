import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { TRANSFORMATIVE_ELEMENTAL_MASTERY_CURVE } from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { TransformativeReactionCoefficientMap } from "#src/services/combat/damage/TransformativeReactionCoefficientMap";
import { takeOne } from "@esposter/shared";

// A transformative reaction's own damage: its coefficient of the triggering character's level multiplier, raised by
// The character's elemental mastery and reaction bonus, and cut by the target's resistance alone, since it ignores
// Defence and cannot crit
export const getTransformativeDamage = (
  transformativeReactionType: TransformativeReactionType,
  level: number,
  elementalMastery: number,
  resistance: number,
  reactionBonus = 0,
): number =>
  TransformativeReactionCoefficientMap[transformativeReactionType] *
  takeOne(CharacterLevelMultiplierMap, level) *
  (1 + getElementalMasteryBonus(elementalMastery, TRANSFORMATIVE_ELEMENTAL_MASTERY_CURVE) + reactionBonus) *
  getResistanceMultiplier(resistance);
