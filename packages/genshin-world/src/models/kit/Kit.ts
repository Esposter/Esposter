import type { Attribute } from "#src/models/character/Attribute";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitMoonsignBenediction } from "#src/models/kit/KitMoonsignBenediction";
import type { KitSkillChain } from "#src/models/kit/KitSkillChain";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitVariant } from "#src/models/kit/KitVariant";
import type { Party } from "#src/models/party/Party";

// A character's combat kit: its normal attack's string, its charged attack, its plunges, its skill and burst with their
// Cooldowns, costs and buttons' icons, and the collision a plunge strikes with as it falls
export interface Kit {
  burstCooldownSeconds: number;
  burstEnergyCost: number;
  chargedAttack: KitAction;
  chargedAttackStamina: number;
  elementalBurst: KitAction;
  // The action the burst plays instead while its check holds on the step it starts, if it has one, such as a burst that
  // Hits harder at low HP
  elementalBurstVariant?: KitVariant;
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
  getChargedAttackStaminaMultiplier?: (context: KitContext) => number;
  // The attributes a passive adds to the character's pricing, as a hit reads them, given the character as it stands and
  // Its HP as a share of its Max HP, which a bonus at low or high HP reads, its current HP being that share of its Max HP
  getPassiveBonuses?: (
    combatant: Combatant,
    healthShare: number,
    deployedCombatants: readonly Combatant[],
  ) => { amount: number; attribute: Attribute }[];
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (context: KitContext) => number;
  // The DMG Bonus a strike of the kit's own adds as it lands on an enemy, if a passive or a constellation raises it
  // Against some enemies only, given the enemy as it stands and the deployed team
  getStrikeDamageBonus?: (strike: KitStrike, enemy: Enemy, party: Party) => number;
  highPlunge: KitAction;
  lowPlunge: KitAction;
  // The character's Moonsign Benediction, if it is a Moonsign character, which counts it toward its party's Moonsign
  moonsignBenediction?: KitMoonsignBenediction;
  normalAttacks: KitAction[];
  // Run on each event of combat while the character is in the deployed team, on the field or off it, given its own
  // Combatant, if its passives or Constellations answer any
  onKitEvent?: (event: KitEvent, context: KitContext, combatant: Combatant) => void;
  // Run on each step the character on the field sprints, to spend the sprint's seconds from the kit's state
  onSprint?: (context: KitContext, kitState: KitState) => void;
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
  // The icons its skill and burst buttons carry, read with the kit from the hosted index by the character's own id, none
  // For a character the index lacks
  skillGlyphs?: SkillGlyphs;
}
