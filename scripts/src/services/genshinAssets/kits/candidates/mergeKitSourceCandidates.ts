import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";

// The source candidates each path's default is chosen from, in the order its field is known by. A field the game's
// Tables hold, its multipliers, stamina, cooldowns, energy and counts, takes the tables first: the dump is the latest
// Version and gcsim copies an older one. Every other field takes gcsim first, then the tables, and the wiki is last
export const mergeKitSourceCandidates = ({
  gcsimCandidateMap,
  tableCandidateMap,
  wikiCandidateMap,
}: {
  gcsimCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  tableCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  wikiCandidateMap: ReadonlyMap<string, KitCandidate[]>;
}): Map<string, KitCandidate[]> => {
  // Keyed in gcsim's order, then the tables' and the wiki's, and each path takes the tables first. A path only gcsim or
  // The wiki gives has no table candidate to take first, so its gcsim then wiki order is the same either way
  const mergedMap = new Map(
    [...gcsimCandidateMap.keys(), ...tableCandidateMap.keys(), ...wikiCandidateMap.keys()].map(
      (path): [string, KitCandidate[]] => [path, []],
    ),
  );
  for (const candidateMap of [tableCandidateMap, gcsimCandidateMap, wikiCandidateMap])
    for (const [path, candidates] of candidateMap)
      for (const candidate of candidates) addKitCandidate(mergedMap, path, candidate);
  return mergedMap;
};
