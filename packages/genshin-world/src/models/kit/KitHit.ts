import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { Element } from "#src/models/Element";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";
import type { KitStackedHit } from "#src/models/kit/KitStackedHit";

// One hit of a kit's action: its gauge of its element if it has one, the element it deals when that is not its
// Character's own, the cylinder it reaches, when its hitmark falls in the action's seconds, its internal cooldown tag,
// Whether it is blunt, its poise damage and the talent's multiplier
export interface KitHit {
  // The poise the hit deals while its attacks are converted by an infusion that converts them, if it has one
  convertedPoiseDamage?: number;
  element?: Element;
  // The status it gives each enemy it strikes, given its striker, before its damage is taken
  enemyStatus?: (combatant: Combatant) => EnemyStatus | undefined;
  gauge?: number;
  // The share of its striker's ATK the hit heals its striker's character by for each enemy it strikes, given the striker
  healAttackShare?: (combatant: Combatant) => number;
  // The heal the party may take from the hit while its striker's character holds a shield, if the hit can give one
  healParty?: KitPartyHeal;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  internalCooldownTag?: InternalCooldownTag;
  isBlunt?: true;
  poiseDamage: number;
  // The talent multiplier and poise the hit deals set by the stacks of a status on each enemy it strikes, if it has one
  stackedHit?: KitStackedHit;
  talentMultiplier: number;
}
