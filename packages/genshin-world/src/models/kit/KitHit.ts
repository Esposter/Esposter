import type { AttackTag } from "#src/models/combat/AttackTag";
import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBubbleSpec } from "#src/models/kit/KitBubbleSpec";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitLunarHit } from "#src/models/kit/KitLunarHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";
import type { KitStackedHit } from "#src/models/kit/KitStackedHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

// One hit of a kit's action: its gauge of its element if it has one, the element it deals when that is not its
// Character's own, the cylinder it reaches, when its hitmark falls from the action's start, its internal cooldown tag,
// Its poise damage and the talent's multiplier
export interface KitHit {
  // The kind of attack the action the hit sits in deals, set as its kit or its stance is built, which an infusion and an
  // Ore follow whatever kind the hit is dealt as. None for a hit no action holds
  actionAttackTag?: AttackTag;
  // The flat damage the hit adds to its base damage, given its striker, if a passive adds one from the striker's stats
  additiveBaseDamageBonus?: (combatant: Combatant) => number;
  // The kind of attack the hit is dealt as, set as its kit or its stance is built from the action it sits in, unless it
  // Names its own. None for a hit no action holds, such as a summon's
  attackTag?: AttackTag;
  // The bubble it holds each enemy it strikes in, if it casts one
  bubble?: KitBubbleSpec;
  // The cylinder the hit reaches while its attacks are converted by an infusion that converts them, if it reaches another
  convertedHitArea?: AttackArea;
  // The poise the hit deals while its attacks are converted by an infusion that converts them, if it has one
  convertedPoiseDamage?: number;
  // The CRIT Rate the hit adds to its striker's as its roll is made, as a passive prices it on the strike, if it carries one
  criticalRateBonus?: number;
  // The CRIT DMG the hit adds to its striker's as its critical damage is priced, if it carries one of its own
  criticalDamageBonus?: number;
  // The DMG Bonus the hit adds to its striker's as it is priced, if it carries one of its own
  damageBonus?: number;
  element?: Element;
  // The status it gives each enemy it strikes, given its striker, before its damage is taken
  enemyStatus?: (combatant: Combatant) => EnemyStatus | undefined;
  gauge?: number;
  // The share of its striker's ATK the hit heals its striker's character by for each enemy it strikes, given the striker
  healAttackShare?: (combatant: Combatant) => number;
  // The heal the party may take from the hit as it strikes, if the hit can give one
  healParty?: KitPartyHeal;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  internalCooldownTag?: InternalCooldownTag;
  // Whether the hit always lands as a critical hit, which its strike rolls no CRIT Rate for
  isForcedCritical?: true;
  // The Lunar reaction the hit deals its damage as, if it is a direct Lunar hit, priced by the Lunar formula rather than
  // As a talent's hit
  lunarHit?: KitLunarHit;
  // Run for each enemy the hit strikes, given the strike with the body it lands from and its striker, and the enemy it
  // Strikes, if the hit gives its striker something back as it lands. Only a strike that reads the enemy takes the third
  // Argument, so a callback given the strike alone is still a valid one
  onStrike?: (context: KitContext, strike: KitStrike, enemy?: Enemy) => void;
  poiseDamage: number;
  // The talent multiplier and poise the hit deals set by the stacks of a status on each enemy it strikes, if it has one
  stackedHit?: KitStackedHit;
  talentMultiplier: number;
  // The index of the one enemy the hit strikes among those its area reaches, wrapped to their count, instead of each of
  // Them, as a shell's hit takes its enemies in turn. None for a hit that strikes every enemy its area reaches
  targetIndex?: number;
  // Whether the hit lands on an enemy's weak point, read as it lands: the strike sets it on an aimed hit to an enemy with weak points
  weakPoint?: boolean;
}
