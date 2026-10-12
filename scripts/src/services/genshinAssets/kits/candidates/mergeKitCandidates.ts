import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";

// The candidates several sources give a kit's record, each path's in the order the sources are passed, so the first
// Source to give a path is its default
export const mergeKitCandidates = (
  ...candidateMaps: readonly ReadonlyMap<string, KitCandidate[]>[]
): Map<string, KitCandidate[]> => {
  const mergedMap = new Map<string, KitCandidate[]>();
  for (const candidateMap of candidateMaps)
    for (const [path, candidates] of candidateMap)
      for (const candidate of candidates) addKitCandidate(mergedMap, path, candidate);
  return mergedMap;
};
