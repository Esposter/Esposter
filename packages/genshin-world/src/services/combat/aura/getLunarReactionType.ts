import type { Reaction } from "#src/models/combat/Reaction";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";

// The Lunar reaction a reaction becomes when a party's Moonsign Benedictions turn it Lunar, if they do: Bloom becomes
// Lunar-Bloom, and the Crystallize of Hydro Lunar-Crystallize
export const getLunarReactionType = (
  { element, reactionType }: Reaction,
  lunarReactionTypes: readonly LunarReactionType[],
): LunarReactionType | undefined => {
  let lunarReactionType: LunarReactionType | undefined;
  if (reactionType === ReactionType.Bloom) lunarReactionType = LunarReactionType.LunarBloom;
  else if (reactionType === ReactionType.Crystallize && element === Element.Hydro)
    lunarReactionType = LunarReactionType.LunarCrystallize;
  return lunarReactionType !== undefined && lunarReactionTypes.includes(lunarReactionType)
    ? lunarReactionType
    : undefined;
};
