import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// The poise damage a reaction's own hit deals, a blunt hit: an Overloaded's explosion 90, as gcsim's Overloaded attack
// Strikes blunt with it (`pkg/reactable/overload.go:53-54` at v2.47.2). Every other reaction's hit strikes as gcsim's
// Default strike, with no poise
export const TransformativeReactionPoiseDamageMap: Partial<Record<TransformativeReactionType, number>> = {
  [TransformativeReactionType.Overloaded]: 90,
};
