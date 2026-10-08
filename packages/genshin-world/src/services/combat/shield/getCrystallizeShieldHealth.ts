import { CRYSTALLIZE_ELEMENTAL_MASTERY_CURVE } from "#src/services/combat/damage/constants";
import { getElementalMasteryBonus } from "#src/services/combat/damage/getElementalMasteryBonus";
import { CrystallizeShieldHealthMap } from "#src/services/combat/shield/CrystallizeShieldHealthMap";
import { takeOne } from "@esposter/shared";

// The health of the shield a Crystallize shard grants: its base for the crystallizing character's level, raised by the
// Character's elemental mastery
export const getCrystallizeShieldHealth = (level: number, elementalMastery: number): number =>
  takeOne(CrystallizeShieldHealthMap, level) *
  (1 + getElementalMasteryBonus(elementalMastery, CRYSTALLIZE_ELEMENTAL_MASTERY_CURVE));
