// A hit's damage as the general formula takes it: the stat its talent scales with and the talent's multiplier, a flat
// Bonus to its base damage, its damage bonus, whether it crits and the critical damage it then adds, the attacker's
// Level, the enemy's defence and the share of it reduced or ignored, the enemy's resistance to its element, and an
// Amplifying reaction's multiplier
export interface DamageOptions {
  additiveBaseDamageBonus?: number;
  amplifyingMultiplier?: number;
  attackerLevel: number;
  criticalDamage?: number;
  damageBonus?: number;
  defense: number;
  defenseIgnored?: number;
  defenseReduction?: number;
  isCritical?: boolean;
  resistance: number;
  stat: number;
  talentMultiplier: number;
}
