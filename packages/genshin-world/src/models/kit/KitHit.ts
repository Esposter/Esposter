import type { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import type { AttackArea } from "#src/models/kit/AttackArea";

// One hit of a kit's action: its gauge of its element if it has one, the cylinder it reaches, when its hitmark falls in
// The action's seconds, its internal cooldown tag, whether it is blunt, its poise damage and the talent's multiplier
export interface KitHit {
  gauge?: number;
  hitArea: AttackArea;
  hitmarkSeconds: number;
  internalCooldownTag?: InternalCooldownTag;
  isBlunt?: true;
  poiseDamage: number;
  talentMultiplier: number;
}
