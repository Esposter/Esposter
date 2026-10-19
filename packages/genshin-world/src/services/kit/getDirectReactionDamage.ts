import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";

// The tail of a direct reaction hit's damage once its reaction damage is priced: the flat bonus added to that damage,
// Cut by the enemy's RES alone, raised by a CRIT hit's CRIT DMG, and the Elevation last, as gcsim (MIT) prices a direct
// Reaction hit
export const getDirectReactionDamage = (
  reactionDamage: number,
  additiveBaseDamageBonus: number,
  resistance: number,
  isCritical: boolean,
  criticalDamageBonus: number,
  elevationBonus: number,
): number =>
  (reactionDamage + additiveBaseDamageBonus) *
  getResistanceMultiplier(resistance) *
  (isCritical ? 1 + criticalDamageBonus : 1) *
  (1 + elevationBonus);
