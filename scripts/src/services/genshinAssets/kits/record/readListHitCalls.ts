import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { readSiteCallsMap } from "#src/services/genshinAssets/kits/record/readSiteCallsMap";

import { checkIsLandingOrdered } from "#src/services/genshinAssets/kits/gcsim/checkIsLandingOrdered";

// The calls a list's hit takes: first the one call of its key that fires at the hit's own hitmark, where the hit has one
// And one call lands there, as a call of another delay the same attack makes is not the list's hit. Else by its place: its
// Own key's calls where they are as many as the list is long, else the calls of the one attack site that makes as many
// Calls as the list is long from keys including its own. A second such site, whether its calls land in an order or not,
// Is a rival the hit cannot tell apart from, so neither is taken
export const readListHitCalls = (
  key: string,
  namedHit: NamedHitCandidate,
  index: number,
  listLength: number,
  siteCallsMap: ReturnType<typeof readSiteCallsMap>,
  hitmark: unknown,
): Map<string, KitCandidate[]> | undefined => {
  const hitmarkCalls = typeof hitmark === "number" ? namedHit.queuedCalls.filter(({ delay }) => delay === hitmark) : [];
  if (hitmarkCalls.length === 1) return hitmarkCalls[0]?.fieldMap;
  if (namedHit.queuedCalls.length === listLength) return namedHit.queuedCalls[index]?.fieldMap;
  const takingSites = [...siteCallsMap.values()].filter(
    ({ calls, keys }) => calls.length === listLength && keys.has(key),
  );
  const takingSite = takingSites.length === 1 ? takingSites[0] : undefined;
  return takingSite !== undefined && checkIsLandingOrdered(takingSite.calls)
    ? takingSite.calls[index]?.fieldMap
    : undefined;
};
