import type { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";

import { CatalyzeReactionCoefficientMap } from "#src/services/combat/damage/CatalyzeReactionCoefficientMap";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { CATALYZE_ELEMENTAL_MASTERY_CURVE } from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";
import { takeOne } from "@esposter/shared";

// The flat bonus Aggravate or Spread adds to its hit's base damage: its coefficient of the triggering character's level
// Multiplier, raised by the character's elemental mastery and reaction bonus. The hit then takes the general formula
export const getCatalyzeBonus = (
  catalyzeReactionType: CatalyzeReactionType,
  level: number,
  elementalMastery: number,
  reactionBonus = 0,
): number =>
  CatalyzeReactionCoefficientMap[catalyzeReactionType] *
  takeOne(CharacterLevelMultiplierMap, level) *
  (1 + getElementalMasteryBonus(elementalMastery, CATALYZE_ELEMENTAL_MASTERY_CURVE) + reactionBonus);
