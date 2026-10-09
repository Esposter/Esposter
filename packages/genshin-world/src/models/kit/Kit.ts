import type { Attribute } from "#src/models/character/Attribute";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSkillChain } from "#src/models/kit/KitSkillChain";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

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
  // The seconds a skill may be held before it is released by itself, if it has a maximum, as Violet Arc's hold is
  elementalSkillMaximumHeldSeconds?: number;
  // The attributes a passive adds to the character's pricing, as a hit reads them, given the character as it stands
  getPassiveBonuses?: (combatant: Combatant) => { amount: number; attribute: Attribute }[];
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (context: KitStepContext) => number;
  highPlunge: KitAction;
  lowPlunge: KitAction;
  normalAttacks: KitAction[];
  // Run on each step the body sprints, to spend the sprint's seconds from the kit's state
  onSprint?: (context: KitStepContext, kitState: KitState) => void;
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
}
