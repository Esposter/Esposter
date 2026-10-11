import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// How far, in metres, each reaction that reaches past its target reaches round it, measured to a target's edge: a
// Burning tick 1 metre, an Overloaded's and a Superconduct's explosion 3 and a Swirl's spread 5, as gcsim's circles on
// The target hold them, and Electro-Charged's arc 5, a Dendro Core's burst and Burgeon 5 about the core and Hyperbloom 1
// About the enemy it lands on, the wiki's figures
export const TransformativeReactionReachRadiusMap: Partial<Record<TransformativeReactionType, number>> = {
  [TransformativeReactionType.Bloom]: 5,
  [TransformativeReactionType.Burgeon]: 5,
  [TransformativeReactionType.Burning]: 1,
  [TransformativeReactionType.ElectroCharged]: 5,
  [TransformativeReactionType.Hyperbloom]: 1,
  [TransformativeReactionType.Overloaded]: 3,
  [TransformativeReactionType.Superconduct]: 3,
  [TransformativeReactionType.Swirl]: 5,
};
