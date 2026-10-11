import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// How far, in metres, each reaction that reaches past its target reaches round it, measured to a target's edge: a
// Burning tick 1 metre, an Overloaded's and a Superconduct's explosion 3 and a Swirl's spread 5, as gcsim's circles on
// The target hold them, and Electro-Charged's arc 5, the wiki's figure
export const TransformativeReactionReachRadiusMap: Partial<Record<TransformativeReactionType, number>> = {
  [TransformativeReactionType.Burning]: 1,
  [TransformativeReactionType.ElectroCharged]: 5,
  [TransformativeReactionType.Overloaded]: 3,
  [TransformativeReactionType.Superconduct]: 3,
  [TransformativeReactionType.Swirl]: 5,
};
