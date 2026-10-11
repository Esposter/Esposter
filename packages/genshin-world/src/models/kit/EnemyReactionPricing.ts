import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";

// What the reactions triggered on one enemy add to the damage that triggered them: the amplifying multiplier, the
// Additive base DMG bonus a catalyze adds, each transformative reaction's own damage, and the reactions that landed and
// Reach round the enemy
export interface EnemyReactionPricing {
  additiveBaseDamageBonus: number;
  amplifyingMultiplier: number;
  reachingReactions: TransformativeReaction[];
  transformativeDamage: number;
}
