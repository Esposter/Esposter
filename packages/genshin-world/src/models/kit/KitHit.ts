import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { Element } from "#src/models/Element";
import type { AttackArea } from "#src/models/kit/AttackArea";

// One hit of a kit's action: its gauge of its element if it has one, the element it deals when that is not its
// Character's own, the cylinder it reaches, when its hitmark falls in the action's seconds, its internal cooldown tag,
// Whether it is blunt, its poise damage and the talent's multiplier
export interface KitHit {
  element?: Element;
  gauge?: number;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  internalCooldownTag?: InternalCooldownTag;
  isBlunt?: true;
  poiseDamage: number;
  talentMultiplier: number;
}
