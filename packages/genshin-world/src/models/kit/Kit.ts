import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSkillChain } from "#src/models/kit/KitSkillChain";
import type { KitSkillCooldownState } from "#src/models/kit/KitSkillCooldownState";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";

// A character's combat kit: its normal attack's string, its charged attack, its plunges, its skill and burst with their
// Cooldowns and costs, and the collision a plunge strikes with as it falls
export interface Kit {
  burstCooldownSeconds: number;
  burstEnergyCost: number;
  chargedAttack: KitAction;
  chargedAttackStamina: number;
  elementalBurst: KitAction;
  elementalSkill: KitAction;
  // The presses a skill can take in a row after its first, if any, which the window of each press allows
  elementalSkillChain?: KitSkillChain;
  // The hold levels a skill has, ordered by their minimum seconds, if it has any. A skill with holds starts on its release
  elementalSkillHolds?: KitSkillHold[];
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (state: KitSkillCooldownState) => number;
  highPlunge: KitAction;
  lowPlunge: KitAction;
  normalAttacks: KitAction[];
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
}
