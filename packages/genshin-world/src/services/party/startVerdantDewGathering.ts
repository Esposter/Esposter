import type { Reaction } from "#src/models/combat/Reaction";
import type { Party } from "#src/models/party/Party";

import { ReactionType } from "#src/models/combat/ReactionType";
import { VERDANT_DEW_GATHERING_SECONDS } from "#src/services/party/constants";

// A Lunar-Bloom among the reactions a strike triggered lets the party's Verdant Dew gather for its seconds from now,
// Written in place, however long was left of the last one's
export const startVerdantDewGathering = (party: Party, reactions: readonly Reaction[]): void => {
  if (reactions.some(({ reactionType }) => reactionType === ReactionType.LunarBloom))
    party.verdantDew.gatheringSeconds = VERDANT_DEW_GATHERING_SECONDS;
};
