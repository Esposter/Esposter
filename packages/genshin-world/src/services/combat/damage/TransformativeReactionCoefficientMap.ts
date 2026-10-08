import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// Each transformative reaction's damage as a multiple of the triggering character's level multiplier
export const TransformativeReactionCoefficientMap: Record<TransformativeReactionType, number> = {
  [TransformativeReactionType.Bloom]: 2,
  [TransformativeReactionType.Burgeon]: 3,
  [TransformativeReactionType.Burning]: 0.25,
  [TransformativeReactionType.ElectroCharged]: 2,
  [TransformativeReactionType.Hyperbloom]: 3,
  [TransformativeReactionType.Overloaded]: 2.75,
  [TransformativeReactionType.Shattered]: 3,
  [TransformativeReactionType.Superconduct]: 1.5,
  [TransformativeReactionType.Swirl]: 0.6,
};
