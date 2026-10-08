// A hit's damage as the general formula takes it: the stat its talent scales with and the talent's multiplier, a flat
// Bonus to its base damage, its damage bonus, whether it crits and the critical damage it then adds, the attacker's
// And the enemy's levels, the share of the enemy's defence reduced or ignored, the enemy's resistance to its element,
// And an amplifying reaction's multiplier
export interface DamageOptions {
  additiveBaseDamageBonus?: number;
  amplifyingMultiplier?: number;
  characterLevel: number;
  criticalDamage?: number;
  damageBonus?: number;
  defenseIgnored?: number;
  defenseReduction?: number;
  enemyLevel: number;
  isCritical?: boolean;
  resistance: number;
  stat: number;
  talentMultiplier: number;
}
