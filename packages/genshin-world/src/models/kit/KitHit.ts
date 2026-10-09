import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { Element } from "#src/models/Element";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";

// One hit of a kit's action: its gauge of its element if it has one, the element it deals when that is not its
// Character's own, the cylinder it reaches, when its hitmark falls in the action's seconds, its internal cooldown tag,
// Whether it is blunt, its poise damage and the talent's multiplier
export interface KitHit {
  element?: Element;
  // The status it gives each enemy it strikes, before its damage is taken
  enemyStatus?: EnemyStatus;
  gauge?: number;
  // The share of its striker's ATK the hit heals its striker's character by for each enemy it strikes, given the striker
  healAttackShare?: (combatant: Combatant) => number;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  internalCooldownTag?: InternalCooldownTag;
  isBlunt?: true;
  poiseDamage: number;
  talentMultiplier: number;
}
