import type { Reaction } from "#src/models/combat/Reaction";

import { ReactionType } from "#src/models/combat/ReactionType";

const STELLAR_GLIMMER_REACTION_TYPES: readonly ReactionType[] = [
  ReactionType.StellarConduct,
  ReactionType.StellarSwirl,
];

// Whether a reaction is a Stellar Glimmer one, a Stellar-Conduct or a Stellar Swirl, the two a Stellar Jubilee enables
export const checkIsStellarGlimmerReaction = ({ reactionType }: Reaction): boolean =>
  STELLAR_GLIMMER_REACTION_TYPES.includes(reactionType);
