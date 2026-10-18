import type { Reaction } from "#src/models/combat/Reaction";

import { ReactionType } from "#src/models/combat/ReactionType";

// Whether a reaction is a Stellar Glimmer one, a Stellar-Conduct or a Stellar Swirl, the two a Stellar Jubilee enables
export const checkIsStellarGlimmerReaction = ({ reactionType }: Reaction): boolean =>
  reactionType === ReactionType.StellarConduct || reactionType === ReactionType.StellarSwirl;
