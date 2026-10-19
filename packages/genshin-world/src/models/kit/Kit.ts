import type { Attribute } from "#src/models/character/Attribute";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitMoonsignBenediction } from "#src/models/kit/KitMoonsignBenediction";
import type { KitReaction } from "#src/models/kit/KitReaction";
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
  chargedAttackVariant?: KitVariant;
  // Whether a skill starts whatever its cooldown is, while the kit's effects waive it, as a constellation's status does
  checkIsSkillCooldownWaived?: (context: KitContext) => boolean;
  // The action the body plays as it enters a dash, if the kit has one, which a stance may give in place of its own
  dash?: KitAction;
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
  // The attributes a stat converted from Max HP adds to the character's pricing, given the character as every ordinary
  // Passive, buff and Enduring Rock bonus leaves it, so its Max HP is the buffed one, and its HP as a share of its
  // Max HP, which a conversion gated on low HP reads. No conversion reads another's output: the kit's and each weapon's
  // Hook are handed the same character, before any conversion's output is on it
  getConversionBonuses?: (combatant: Combatant, healthShare: number) => { amount: number; attribute: Attribute }[];
  // The hit a kit's own normal attack adds after each of its hits that lands, if a constellation gives one, given the
  // Hit that landed and the normal attack's place in the kit's chain, from 0, so a hook can tell its last hit or its attack
  getNormalAttackExtraHit?: (context: KitContext, hit: KitHit, chainIndex: number) => KitHit | undefined;
  // The Normal ATK SPD a normal attack of the kit's own plays faster by, on top of its infusion's, if a passive or a
  // Constellation raises it, given the kit's effects as they stand
  getNormalAttackSpeedBonus?: (context: KitContext) => number;
  // The flat base damage, CRIT DMG, CRIT Rate, DMG Bonus and Elevation a deployed member's kit adds to a reaction a member
  // Makes, given the member whose kit it is, the reaction and the world's combat state the reaction lands in, which holds the
  // Deployed team and the effects on it. A kit reads its own reactions here too, and guards on the reaction's combatant being
  // Itself. The Elevation multiplies a Lunar or Stellar reaction's damage and a direct Lunar hit's last, the only damage the
  // Game elevates
  getPartyReactionBonus?: (
    member: Combatant,
    reaction: KitReaction,
    context: KitContext,
  ) => {
    additiveBaseDamageBonus?: number;
    criticalDamageBonus?: number;
    criticalRateBonus?: number;
    damageBonus?: number;
    elevationBonus?: number;
  };
  // The flat base damage, CRIT DMG, CRIT Rate and DMG Bonus a deployed member's kit adds to a strike another member lands on,
  // Given the member whose kit it is, the strike as priced, the enemy it lands on, the deployed team, the effects on
  // It and the team's built combatants by id, which a member's current attributes are read from. A member's own strikes
  // Are priced by its own hooks, not this one. The defence it ignores joins the hit's defenseIgnored
  getPartyStrikeBonus?: (
    member: Combatant,
    strike: KitStrike,
    enemy: Enemy,
    party: Party,
    effects: readonly KitEffect[],
    characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  ) => {
    additiveBaseDamageBonus?: number;
    criticalDamageBonus?: number;
    criticalRateBonus?: number;
    damageBonus?: number;
    defenseIgnored?: number;
  };
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
  // The extra charges of the elemental skill a constellation gives the character as it stands, on top of the kit's
  // Own charges, given the combatant as it stands
  getSkillChargeBonus?: (combatant: Combatant) => number;
  // The factor a skill's cooldown is multiplied by as it starts, if a passive or a field lowers it
  getSkillCooldownMultiplier?: (context: KitContext) => number;
  // The flat base damage a strike of the kit's own adds as it lands on an enemy, if a passive adds one from the striker's
  // Stats, given the enemy as it stands, the deployed team, the effects on it and the team's built combatants by id, which
  // A share of the team's elements is read from
  getStrikeAdditiveBaseDamageBonus?: (
    strike: KitStrike,
    enemy: Enemy,
    party: Party,
    effects: readonly KitEffect[],
    characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  ) => number;
  // The CRIT DMG a strike of the kit's own adds as it lands on an enemy, if a constellation raises it on the strike, given the
  // Enemy as it stands, the deployed team and the effects on it
  getStrikeCriticalDamageBonus?: (
    strike: KitStrike,
    enemy: Enemy,
    party: Party,
    effects: readonly KitEffect[],
  ) => number;
  // The CRIT Rate a strike of the kit's own adds as its roll is made against an enemy, if a passive or a constellation raises
  // It on the strike, against some enemies only, given the enemy as it stands, the deployed team and the effects on it
  getStrikeCriticalRateBonus?: (strike: KitStrike, enemy: Enemy, party: Party, effects: readonly KitEffect[]) => number;
  // The DMG Bonus a strike of the kit's own adds as it lands on an enemy, if a passive or a constellation raises it
  // Against some enemies only, given the enemy as it stands, the deployed team and the effects on it, which a constellation
  // Reads for a bonus its kit's actions set going
  getStrikeDamageBonus?: (strike: KitStrike, enemy: Enemy, party: Party, effects: readonly KitEffect[]) => number;
  // The share of its enemy's defence a strike of the kit's own ignores as it lands on an enemy, if a constellation gives one,
  // Given the enemy as it stands, the deployed team and the effects on it
  getStrikeDefenceIgnored?: (strike: KitStrike, enemy: Enemy, party: Party, effects: readonly KitEffect[]) => number;
  highPlunge: KitAction;
  // The action the body plays as it enters a jump, if the kit has one, which a stance may give in place of its own
  jump?: KitAction;
  // Whether a skill with holds releases at its top level whatever seconds it was held, as a counter window on its
  // Character does, given the context the release starts in
  jumpsSkillHoldToTop?: (context: KitContext) => boolean;
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
  // Run on each step the character on the field sprints, given the step's seconds, to spend the sprint's seconds from
  // Kit's state, or to drain a sprint's points on the step it starts
  onSprint?: (context: KitContext, kitState: KitState, stepSeconds: number) => void;
  // Run on each step while the character is in the deployed team, on the field or off it, given its own Combatant and
  // The step's seconds, for a clock a constellation or a weapon's passive keeps while its character stands in the team
  onStep?: (context: KitContext, combatant: Combatant, stepSeconds: number) => void;
  plungeCollision: KitHit;
  // The plunges a character's skill state turns its plunge into while each one's check holds, the first holding one playing
  // In place of the standard plunge when the body lands, as Xianyun's Driftcloud Wave does at each Skyladder press
  plungeVariants?: KitVariant[];
  // Whether the kit refuses a fall its own character would take, given its own Combatant and the effects on it, which
  // Leaves the character at 1 HP while the check holds, and a constellation's refusal starts its cooldown here
  refusesFall?: (combatant: Combatant, kitEffectState: KitEffectState) => boolean;
  skillCooldownSeconds: number;
  // The icons its skill and burst buttons carry, read with the kit from the hosted index by the character's own id, none
  // For a character the index lacks
  skillGlyphs?: SkillGlyphs;
  // The character's Stellar Jubilee passive, if it has one, which enables Stellar reactions for its party
  stellarJubilee?: KitStellarJubilee;
}
