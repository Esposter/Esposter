import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";

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
  const gcsimFirstMap = mergeKitCandidates(gcsimCandidateMap, tableCandidateMap, wikiCandidateMap);
  const tableFirstMap = mergeKitCandidates(tableCandidateMap, gcsimCandidateMap, wikiCandidateMap);
  return new Map(
    [...gcsimFirstMap].map(([path, candidates]) => [
      path,
      tableCandidateMap.has(path) ? (tableFirstMap.get(path) ?? candidates) : candidates,
    ]),
  );
};
