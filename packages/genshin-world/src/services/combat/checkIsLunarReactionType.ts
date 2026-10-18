import type { ReactionType } from "#src/models/combat/ReactionType";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";

const LUNAR_REACTION_TYPES = new Set<ReactionType>(Object.values(LunarReactionType));

// Whether a reaction is one of the Lunar reactions, whose damage is Lunar
export const checkIsLunarReactionType = (reactionType: ReactionType): boolean => LUNAR_REACTION_TYPES.has(reactionType);
