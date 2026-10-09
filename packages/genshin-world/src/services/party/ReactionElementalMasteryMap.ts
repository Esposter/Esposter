import { ReactionType } from "#src/models/combat/ReactionType";

// The Elemental Mastery a reaction gives each party member under Sprawling Greenery, for its seconds: 30 after Burning,
// Quicken, Bloom or Lunar-Bloom, and 20 after Aggravate, Spread, Hyperbloom or Burgeon, as the Elemental Resonance page
// Of the Genshin Impact Wiki gives them. Lunar-Bloom is not a reaction here yet, and no strike triggers Hyperbloom or
// Burgeon yet, as their Dendro Core reaction (`DendroCoreReactionTypeMap`) is not read by one
export const ReactionElementalMasteryMap: Partial<Record<ReactionType, number>> = {
  [ReactionType.Aggravate]: 20,
  [ReactionType.Bloom]: 30,
  [ReactionType.Burgeon]: 20,
  [ReactionType.Burning]: 30,
  [ReactionType.Hyperbloom]: 20,
  [ReactionType.Quicken]: 30,
  [ReactionType.Spread]: 20,
};
