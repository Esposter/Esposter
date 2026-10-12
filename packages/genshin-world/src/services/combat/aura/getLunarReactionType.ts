import type { Reaction } from "#src/models/combat/Reaction";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";

// The Lunar reaction a reaction becomes when a party's Moonsign Benedictions turn it Lunar, if they do: Bloom becomes
// Lunar-Bloom
export const getLunarReactionType = (
  { reactionType }: Reaction,
  lunarReactionTypes: readonly LunarReactionType[],
): LunarReactionType | undefined => {
  const lunarReactionType = reactionType === ReactionType.Bloom ? LunarReactionType.LunarBloom : undefined;
  return lunarReactionType !== undefined && lunarReactionTypes.includes(lunarReactionType)
    ? lunarReactionType
    : undefined;
};
