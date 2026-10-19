import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";

// A transformative reaction's damage with its creator's party reaction bonuses: the DMG Bonus inside its multiplier, and the
// Flat base added before the enemy's RES, as strikeReactionDamage takes it
export const getPartyTransformativeDamage = (
  reactionType: TransformativeReactionType,
  level: number,
  elementalMastery: number,
  resistance: number,
  damageBonus: number,
  additiveBaseDamageBonus: number,
): number =>
  getTransformativeDamage(reactionType, level, elementalMastery, resistance, damageBonus) +
  additiveBaseDamageBonus * getResistanceMultiplier(resistance);
