import type { Talk } from "#src/models/dialogue/Talk";

// The talks the world holds by id, merged from its sources in order: where two sources hold a talk of one id, the earlier
// Source's is the talk the world runs, so a quest's talk wins over a resident's standing talk
export const mergeTalks = (...talkSources: (readonly Talk[])[]): ReadonlyMap<string, Talk> => {
  const talkMap = new Map<string, Talk>();
  for (const talks of talkSources) for (const talk of talks) if (!talkMap.has(talk.id)) talkMap.set(talk.id, talk);
  return talkMap;
};
