import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate } from "#src/models/genshinAssets/kits/NamedHitCandidate";
import type { readSiteCallsMap } from "#src/services/genshinAssets/kits/record/readSiteCallsMap";

import { checkIsLandingOrdered } from "#src/services/genshinAssets/kits/gcsim/checkIsLandingOrdered";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";

// The calls a list's hit takes: first the one call of its key that fires at the hit's own hitmark, where the hit
// Has one and one call lands there, as a call of another delay the same attack makes is not the list's hit. Else by
// Its place: its own key's calls where they are as many as the list is long and land in a known order, which they do
// Not where one of several has no delay, as it could land anywhere among them. Where they are as many and their order
// Is not known, the fields every one of them gives alike. Else the calls of the one attack site that makes as many
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
  // The calls land in a known order where each has a delay, ties keeping their source order, or the key makes one call
  const isOrderKnown =
    namedHit.queuedCalls.length === 1 || namedHit.queuedCalls.every(({ delay }) => delay !== undefined);
  if (namedHit.queuedCalls.length === listLength)
    if (isOrderKnown) {
      // A call with no delay gives its hit no hitmark, so the hit takes none of its fields unless its hitmark is set
      const ownCall = namedHit.queuedCalls[index];
      if (ownCall?.delay !== undefined || hitmark !== undefined) return ownCall?.fieldMap;
    } else {
      // Where the order is not known, the hit takes the fields every one of the key's calls gives alike
      const [firstCall, ...otherCalls] = namedHit.queuedCalls;
      const alikeFieldMap = new Map(
        [...(firstCall?.fieldMap ?? [])].filter(([field, candidates]) =>
          otherCalls.every(({ fieldMap }) => {
            const otherCandidates = fieldMap.get(field);
            return (
              otherCandidates !== undefined && checkIsKitValueEqual(otherCandidates[0]?.value, candidates[0]?.value)
            );
          }),
        ),
      );
      if (alikeFieldMap.size > 0) return alikeFieldMap;
    }
  const takingSites = [...siteCallsMap.values()].filter(
    ({ calls, keys }) => calls.length === listLength && keys.has(key),
  );
  const takingSite = takingSites.length === 1 ? takingSites[0] : undefined;
  return takingSite !== undefined && checkIsLandingOrdered(takingSite.calls)
    ? takingSite.calls[index]?.fieldMap
    : undefined;
};
