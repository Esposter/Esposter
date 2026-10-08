import type { DamageOptions } from "#src/models/combat/DamageOptions";

import { DEFENSE_LEVEL_OFFSET } from "#src/services/combat/damage/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";

// A hit's damage by the game's general formula: its base damage, the talent's multiplier of its stat plus any flat bonus,
// Raised by its damage bonus and a crit, and cut by the enemy's defence, which an attacker of the enemy's level halves
// And reduction or ignoring lowers, and by its resistance, then multiplied by an amplifying reaction's multiplier
export const getDamage = ({
  additiveBaseDamageBonus = 0,
  amplifyingMultiplier = 1,
  characterLevel,
  criticalDamage = 0,
  damageBonus = 0,
  defenseIgnored = 0,
  defenseReduction = 0,
  enemyLevel,
  isCritical = false,
  resistance,
  stat,
  talentMultiplier,
}: DamageOptions): number => {
  const baseDamage = talentMultiplier * stat + additiveBaseDamageBonus;
  const characterDefenseLevel = characterLevel + DEFENSE_LEVEL_OFFSET;
  const enemyDefenseLevel = enemyLevel + DEFENSE_LEVEL_OFFSET;
  const defenseMultiplier =
    characterDefenseLevel / ((1 - defenseReduction) * (1 - defenseIgnored) * enemyDefenseLevel + characterDefenseLevel);
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
