import type { Talk } from "#src/models/dialogue/Talk";
import type { Resident } from "#src/models/world/Resident";

// The standing talks the residents hold, whatever the quests hold: a resident whose duel names a game holds the talk
// Written for its talk, and a resident whose duel names none holds none
export const getStandingTalks = (residents: readonly Resident[], standingTalkMap: ReadonlyMap<string, Talk>): Talk[] =>
  residents.flatMap(({ duelGameId, talkId }) => {
    const talk = duelGameId === undefined ? undefined : standingTalkMap.get(talkId);
    return talk ? [talk] : [];
  });
