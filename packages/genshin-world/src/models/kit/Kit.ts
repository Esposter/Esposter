import type { Attribute } from "#src/models/character/Attribute";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitMoonsignBenediction } from "#src/models/kit/KitMoonsignBenediction";
import type { KitSkillChain } from "#src/models/kit/KitSkillChain";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStellarJubilee } from "#src/models/kit/KitStellarJubilee";
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
  // The hit a kit's own normal attack adds after each of its hits that lands, if a constellation gives one, given the
  // Hit that landed and the normal attack's place in the kit's chain, from 0, so a hook can tell its last hit or its attack
  getNormalAttackExtraHit?: (context: KitContext, hit: KitHit, chainIndex: number) => KitHit | undefined;
  // The Normal ATK SPD a normal attack of the kit's own plays faster by, on top of its infusion's, if a passive or a
  // Constellation raises it, given the kit's effects as they stand
  getNormalAttackSpeedBonus?: (context: KitContext) => number;
  // The attributes a passive adds to the character's pricing, as a hit reads them, given the character as it stands, its
  // HP as a share of its Max HP, which a bonus at low or high HP reads, and the deployed team's built combatants, each
  // Flagged with whether it is on the field, which a bonus gated on the field reads, and the effects on the team, which
  // A bonus gated on a status reads
  getPassiveBonuses?: (
    combatant: Combatant,
    healthShare: number,
    deployedCombatants: readonly DeployedCombatant[],
    effects: readonly KitEffect[],
  ) => { amount: number; attribute: Attribute }[];
  // The DMG bonus a transformative reaction adds to its own damage, if a constellation raises it for that reaction,
  // Given the combatant as it stands and the reaction
  getReactionDamageBonus?: (combatant: Combatant, reactionType: TransformativeReactionType) => number;
  // The extra charges of the elemental skill a constellation gives the character as it stands, on top of the kit's
  // Own charges, given the combatant as it stands
  getSkillChargeBonus?: (combatant: Combatant) => number;
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (context: KitContext) => number;
  // The DMG Bonus a strike of the kit's own adds as it lands on an enemy, if a passive or a constellation raises it
  // Against some enemies only, given the enemy as it stands, the deployed team and the effects on it, which a constellation
  // Reads for a bonus its kit's actions set going
  getStrikeDamageBonus?: (strike: KitStrike, enemy: Enemy, party: Party, effects: readonly KitEffect[]) => number;
  // The flat base damage a strike of the kit's own adds as it lands on an enemy, if a passive adds one from the striker's
  // Stats, given the enemy as it stands, the deployed team and the effects on it
  getStrikeAdditiveBaseDamageBonus?: (
    strike: KitStrike,
    enemy: Enemy,
    party: Party,
    effects: readonly KitEffect[],
  ) => number;
  // The CRIT Rate a strike of the kit's own adds as its roll is made against an enemy, if a passive or a constellation raises
  // It on the strike, against some enemies only, given the enemy as it stands, the deployed team and the effects on it
  getStrikeCriticalRateBonus?: (strike: KitStrike, enemy: Enemy, party: Party, effects: readonly KitEffect[]) => number;
  highPlunge: KitAction;
  // Whether an action that ends keeps the normal attack string where it stands, rather than starting it over, as a
  // Constellation's exception to the actions that break it
  keepsNormalAttackCombo?: (context: KitContext, action: KitAction) => boolean;
  lowPlunge: KitAction;
  // The character's Moonsign Benediction, if it is a Moonsign character, which counts it toward its party's Moonsign
  moonsignBenediction?: KitMoonsignBenediction;
  normalAttacks: KitAction[];
  // Run on each event of combat while the character is in the deployed team, on the field or off it, given its own
  // Combatant, if its passives or Constellations answer any
  onKitEvent?: (event: KitEvent, context: KitContext, combatant: Combatant) => void;
  // Run on each step the character on the field sprints, to spend the sprint's seconds from the kit's state
  onSprint?: (context: KitContext, kitState: KitState) => void;
  // Run on each step while the character is in the deployed team, on the field or off it, given its own Combatant and
  // The step's seconds, for a clock a constellation keeps while its character stands in the team
  onStep?: (context: KitContext, combatant: Combatant, stepSeconds: number) => void;
  plungeCollision: KitHit;
  skillCooldownSeconds: number;
  // The icons its skill and burst buttons carry, read with the kit from the hosted index by the character's own id, none
  // For a character the index lacks
  skillGlyphs?: SkillGlyphs;
  // The character's Stellar Jubilee passive, if it has one, which enables Stellar reactions for its party
  stellarJubilee?: KitStellarJubilee;
}
