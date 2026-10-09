// One hit on an ore: whether it is blunt or melee, and the poise damage the kit gives it. A hit neither blunt nor melee
// Adds nothing to an ore's break
export interface OreHit {
  isBlunt: boolean;
  isMelee: boolean;
  poiseDamage: number;
}
