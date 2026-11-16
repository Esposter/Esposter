import type { AttackTag } from "#src/models/combat/AttackTag";
import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
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
  actionAttackTag?: AttackTag | undefined;
  // The flat damage the hit adds to its base damage, given its striker, if a passive adds one from the striker's stats
  additiveBaseDamageBonus?: ((combatant: Combatant) => number) | undefined;
  // The kind of attack the hit is dealt as, set as its kit or its stance is built from the action it sits in, unless it
  // Names its own. None for a hit no action holds, such as a summon's
  attackTag?: AttackTag | undefined;
  // The bubble it holds each enemy it strikes in, if it casts one
  bubble?: KitBubbleSpec | undefined;
  // The cylinder the hit reaches while its attacks are converted by an infusion that converts them, if it reaches another
  convertedHitArea?: AttackArea | undefined;
  // The poise the hit deals while its attacks are converted by an infusion that converts them, if it has one
  convertedPoiseDamage?: number | undefined;
  // The CRIT DMG the hit adds to its striker's as its critical damage is priced, if it carries one of its own
  criticalDamageBonus?: number | undefined;
  // The CRIT Rate the hit adds to its striker's as its roll is made, as a passive prices it on the strike, if it carries one
  criticalRateBonus?: number | undefined;
  // The DMG Bonus the hit adds to its striker's as it is priced, if it carries one of its own
  damageBonus?: number | undefined;
  // The share of its enemy's defence the hit ignores as it is dealt, if a constellation or a deployed member's kit gives it one
  defenseIgnored?: number | undefined;
  element?: Element | undefined;
  // The status it gives each enemy it strikes, given its striker and the striker's Max HP as the hit lands, before its
  // Damage is taken
  enemyStatus?: ((combatant: Combatant, maxHealth: number) => EnemyStatus | undefined) | undefined;
  // The status it gives each enemy it strikes once its damage lands, given its striker, if the hit deals that enemy damage
  enemyStatusAfterDamage?: ((combatant: Combatant) => EnemyStatus | undefined) | undefined;
  gauge?: number | undefined;
  // The share of its striker's ATK the hit heals its striker's character by for each enemy it strikes, given the striker
  healAttackShare?: ((combatant: Combatant) => number) | undefined;
  // The heal the party may take from the hit as it strikes, if the hit can give one
  healParty?: KitPartyHeal | undefined;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  // The gauge the hit deals while an infusion takes it, if not the infused element's 1U: a plunge's collision's 0U
  infusedGauge?: number | undefined;
  internalCooldownTag?: InternalCooldownTag | undefined;
  // Whether the hit is blunt by its own record, or by the behaviour that builds it, which `checkIsBluntHit` reads with
  // The Geo rule for a hit that names no element of its own
  isBlunt?: true | undefined;
  // Whether the hit always lands as a critical hit, which its strike rolls no CRIT Rate for
  isForcedCritical?: true | undefined;
  // Whether the hit's stagger level is Air, as the wiki's impulse types 5 to 9 are, which launches an enemy it staggers
  isLaunching?: true | undefined;
  // Whether the hit lands as its hitmark falls, given the context it lands in, for a hit a condition such as a Moonsign
  // Level gates. A hit with none always lands
  landsWhen?: ((context: KitContext) => boolean) | undefined;
  // The Lunar reaction the hit deals its damage as, if it is a direct Lunar hit, priced by the Lunar formula rather than
  // As a talent's hit
  lunarHit?: KitLunarHit | undefined;
  // Run for each enemy the hit strikes, given the strike with the body it lands from and its striker, and the enemy it
  // Strikes, for a hit that gives its striker something back as it lands
  onStrike?: ((context: KitContext, strike: KitStrike, enemy: Enemy) => void) | undefined;
  poiseDamage: number;
  // The talent multiplier and poise the hit deals set by the stacks of a status on each enemy it strikes, if it has one
  stackedHit?: KitStackedHit | undefined;
  // The Stellar Glimmer reaction the hit deals its damage as, if it is a direct Stellar hit, priced by the Glimmer
  // Formula rather than as a talent's hit, as a talent or constellation alone deals Stellar-Conduct DMG
  stellarReactionType?: StellarReactionType | undefined;
  talentMultiplier: number;
  // The index of the one enemy the hit strikes among those its area reaches, wrapped to their count, instead of each of
  // Them, as a shell's hit takes its enemies in turn. None for a hit that strikes every enemy its area reaches
  targetIndex?: number | undefined;
  // Whether the hit lands on an enemy's weak point, read as it lands: the strike sets it on an aimed hit to an enemy with weak points
  weakPoint?: boolean | undefined;
}
