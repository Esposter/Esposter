import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { Element } from "#src/models/Element";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBubbleSpec } from "#src/models/kit/KitBubbleSpec";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";
import type { KitStackedHit } from "#src/models/kit/KitStackedHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

// One hit of a kit's action: its gauge of its element if it has one, the element it deals when that is not its
// Character's own, the cylinder it reaches, when its hitmark falls in the action's seconds, its internal cooldown tag,
// Whether it is blunt, its poise damage and the talent's multiplier
export interface KitHit {
  // The bubble it holds each enemy it strikes in, if it casts one
  bubble?: KitBubbleSpec;
  // The cylinder the hit reaches while its attacks are converted by an infusion that converts them, if it reaches another
  convertedHitArea?: AttackArea;
  // The poise the hit deals while its attacks are converted by an infusion that converts them, if it has one
  convertedPoiseDamage?: number;
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
  isBlunt?: true;
  // Run for each enemy the hit strikes, given the body it lands from, its striker and the team's effects, if the hit gives
  // Its striker something back as it lands
  onStrike?: (context: KitStepContext) => void;
  poiseDamage: number;
  // The talent multiplier and poise the hit deals set by the stacks of a status on each enemy it strikes, if it has one
  stackedHit?: KitStackedHit;
  talentMultiplier: number;
}
