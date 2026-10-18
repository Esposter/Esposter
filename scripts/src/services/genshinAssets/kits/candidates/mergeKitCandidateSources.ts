import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitCandidateSources } from "#src/models/genshinAssets/kits/KitCandidateSources";

import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";

// The one order a path's default is chosen in: the named lists' hits, then the sources' values, the named hits' fields and
// The rules. Each caller computes its maps at the point of its run it needs, so the order is the only thing shared
export const mergeKitCandidateSources = ({
  namedHitCandidateMap,
  namedListCandidateMap,
  ruleCandidateMap,
  sourceCandidateMap,
}: KitCandidateSources): Map<string, KitCandidate[]> =>
  mergeKitCandidates(namedListCandidateMap, sourceCandidateMap, namedHitCandidateMap, ruleCandidateMap);
