import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";

// What the reactions triggered on one enemy add to the damage that triggered them: the amplifying multiplier, the
// Additive base DMG bonus a catalyze adds, each transformative reaction's own damage and the poise damage its own hit
// Deals there, and the reactions that landed and reach round the enemy
export interface EnemyReactionPricing {
  additiveBaseDamageBonus: number;
  amplifyingMultiplier: number;
  poiseDamage: number;
  reachingReactions: TransformativeReaction[];
  transformativeDamage: number;
}
