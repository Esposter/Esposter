import type { Reaction } from "#src/models/combat/Reaction";

import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";

// The Stellar reaction a reaction becomes when a party's Stellar Jubilee passives enable it, if they do: a Cryo Swirl
// Becomes Stellar Swirl, and a Superconduct, which is always of Cryo, Stellar-Conduct
export const getStellarReactionType = (
  { element, reactionType }: Reaction,
  stellarReactionTypes: readonly StellarReactionType[],
): StellarReactionType | undefined => {
  let stellarReactionType: StellarReactionType | undefined;
  if (reactionType === ReactionType.Swirl && element === Element.Cryo)
    stellarReactionType = StellarReactionType.StellarSwirl;
  else if (reactionType === ReactionType.Superconduct) stellarReactionType = StellarReactionType.StellarConduct;
  return stellarReactionType !== undefined && stellarReactionTypes.includes(stellarReactionType)
    ? stellarReactionType
    : undefined;
};
