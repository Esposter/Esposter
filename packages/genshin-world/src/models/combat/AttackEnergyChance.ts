// The chance a normal or charged attack's hit on an enemy gives its character energy: the chance it starts at, and what
// It rises by with each such hit that gives none
export interface AttackEnergyChance {
  base: number;
  increase: number;
}
