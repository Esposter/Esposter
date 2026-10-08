import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

// A character's combat kit: its normal attack's string, its charged attack, its plunges, its skill and burst with their
// Cooldowns and costs, and the collision a plunge strikes with as it falls
export interface Kit {
  burstCooldownSeconds: number;
  burstEnergyCost: number;
  chargedAttack: KitAction;
  chargedAttackStamina: number;
  elementalBurst: KitAction;
  elementalSkill: KitAction;
  highPlunge: KitAction;
  lowPlunge: KitAction;
  normalAttacks: KitAction[];
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
}
