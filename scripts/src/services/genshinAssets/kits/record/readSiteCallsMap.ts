import type { NamedHitCall } from "#src/models/genshinAssets/kits/NamedHitCall";
import type { NamedHitCandidate } from "#src/models/genshinAssets/kits/NamedHitCandidate";

import { compareQueuedDelays } from "#src/services/genshinAssets/kits/compareQueuedDelays";

// The calls each attack site makes of a list's joined keys, merged in the order they land, with the keys making them. A
// Delay missing or two calls at one delay leaves no order to merge by, which readListHitCalls checks before taking them
export const readSiteCallsMap = (
  namedHits: ReadonlyMap<string, NamedHitCandidate>,
): Map<string, { calls: NamedHitCall[]; keys: Set<string> }> => {
  const siteCallsMap = new Map<string, { calls: NamedHitCall[]; keys: Set<string> }>();
  for (const [key, { queuedCalls }] of namedHits)
    for (const call of queuedCalls) {
      const siteCalls = siteCallsMap.get(call.site) ?? { calls: [], keys: new Set<string>() };
      siteCalls.calls.push(call);
      siteCalls.keys.add(key);
      siteCallsMap.set(call.site, siteCalls);
    }
  return new Map(
    Array.from(siteCallsMap, ([site, { calls, keys }]): [string, { calls: NamedHitCall[]; keys: Set<string> }] => [
      site,
      { calls: calls.toSorted(compareQueuedDelays), keys },
    ]),
  );
};
