import type { AttackArea } from "#src/models/kit/AttackArea";

// One hit on an ore: the area it reaches, whether it is blunt or melee, and the poise damage the kit gives it. A hit neither
// Blunt nor melee adds nothing to an ore's break
export interface OreHit {
  hitArea: AttackArea;
  isBlunt: boolean;
  isMelee: boolean;
  poiseDamage: number;
}
