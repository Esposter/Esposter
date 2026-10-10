import type { Attribute } from "#src/models/character/Attribute";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitEventContext } from "#src/models/kit/KitEventContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSkillChain } from "#src/models/kit/KitSkillChain";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";

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
  // The charges the skill holds, if more than one: each use spends one, and they come back one at a time, each on the
  // Skill's cooldown
  elementalSkillCharges?: number;
  // The hold levels a skill has, ordered by their minimum seconds, if it has any. A skill with holds starts on its release
  elementalSkillHolds?: KitSkillHold[];
  // The seconds a skill may be held before it is released by itself, if it has a maximum, as Violet Arc's hold is
  elementalSkillMaximumHeldSeconds?: number;
  // The factor a charged attack's stamina is multiplied by as it starts, if a passive lowers it
  getChargedAttackStaminaMultiplier?: (context: KitStepContext) => number;
  // The attributes a passive adds to the character's pricing, as a hit reads them, given the character as it stands
  getPassiveBonuses?: (combatant: Combatant) => { amount: number; attribute: Attribute }[];
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (context: KitStepContext) => number;
  // The DMG Bonus a strike of the kit's own adds as it lands on an enemy, if a passive or a constellation raises it
  // Against some enemies only, given the enemy as it stands and the deployed team
  getStrikeDamageBonus?: (strike: KitStrike, enemy: Enemy, party: Party) => number;
  highPlunge: KitAction;
  lowPlunge: KitAction;
  normalAttacks: KitAction[];
  // Run on each event of combat while the character is in the deployed team, on the field or off it, if its passives or
  // Constellations answer any
  onKitEvent?: (event: KitEvent, context: KitEventContext) => void;
  // Run on each step the body sprints, to spend the sprint's seconds from the kit's state
  onSprint?: (context: KitStepContext, kitState: KitState) => void;
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
}
