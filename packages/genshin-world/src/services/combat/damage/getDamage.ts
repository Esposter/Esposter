import type { DamageOptions } from "#src/models/combat/DamageOptions";

import { ATTACKER_LEVEL_DEFENSE_OFFSET, ATTACKER_LEVEL_DEFENSE_SCALE } from "#src/services/combat/damage/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";

// A hit's damage by the game's general formula: its base damage, the talent's multiplier of its stat plus any flat bonus,
// Raised by its damage bonus and a crit, and cut by the enemy's defence against the attacker's level, which reduction or
// Ignoring lowers, and by its resistance, then multiplied by an amplifying reaction's multiplier
export const getDamage = ({
  additiveBaseDamageBonus = 0,
  amplifyingMultiplier = 1,
  attackerLevel,
  criticalDamage = 0,
  damageBonus = 0,
  defense,
  defenseIgnored = 0,
  defenseReduction = 0,
  isCritical = false,
  resistance,
  stat,
  talentMultiplier,
}: DamageOptions): number => {
  const baseDamage = talentMultiplier * stat + additiveBaseDamageBonus;
  const attackerDefenseLevel = ATTACKER_LEVEL_DEFENSE_SCALE * attackerLevel + ATTACKER_LEVEL_DEFENSE_OFFSET;
  const defenseMultiplier =
    attackerDefenseLevel / ((1 - defenseReduction) * (1 - defenseIgnored) * defense + attackerDefenseLevel);
  const criticalMultiplier = isCritical ? 1 + criticalDamage : 1;
  return (
    baseDamage *
    (1 + damageBonus) *
    criticalMultiplier *
    defenseMultiplier *
    getResistanceMultiplier(resistance) *
    amplifyingMultiplier
  );
};
