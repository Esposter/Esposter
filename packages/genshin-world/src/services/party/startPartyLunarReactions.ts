import type { Reaction } from "#src/models/combat/Reaction";
import type { Party } from "#src/models/party/Party";

import { ReactionType } from "#src/models/combat/ReactionType";
import {
  LUNAR_CHARGED_CLOUD_FIRST_TICK_SECONDS,
  LUNAR_CHARGED_CLOUD_SECONDS,
  VERDANT_DEW_GATHERING_SECONDS,
} from "#src/services/party/constants";

// The party's answer to the Lunar reactions a strike triggered, written in place: a Lunar-Bloom lets its Verdant Dew
// Gather for its seconds from now, however long was left of the last one's, and a Lunar-Charged forms its Lunar-Charged
// Cloud, first ticking 9 frames on, or keeps the one standing for its full seconds again
export const startPartyLunarReactions = (party: Party, reactions: readonly Reaction[]): void => {
  const { lunarChargedCloud, verdantDew } = party;
  for (const { reactionType } of reactions)
    if (reactionType === ReactionType.LunarBloom) verdantDew.gatheringSeconds = VERDANT_DEW_GATHERING_SECONDS;
    else if (reactionType === ReactionType.LunarCharged) {
      if (lunarChargedCloud.secondsRemaining <= 0)
        lunarChargedCloud.tickSeconds = LUNAR_CHARGED_CLOUD_FIRST_TICK_SECONDS;
      lunarChargedCloud.secondsRemaining = LUNAR_CHARGED_CLOUD_SECONDS;
    }
};
