import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { checkIsNoActionFileCandidate } from "#src/services/genshinAssets/kits/candidates/checkIsNoActionFileCandidate";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";

// The source candidates each path's default is chosen from, in the order its field is known by. A field the game's
// Tables hold, its multipliers, stamina, cooldowns, energy and counts, takes the tables first: the dump is the latest
// Version and gcsim copies an older one. Every other field takes the kit's own gcsim value first, then the wiki's.
// A stand-in, a gcsim candidate cited as NoActionFile for a kit gcsim has no file for, comes after the wiki, since no
// Source states its value for the kit
export const mergeKitSourceCandidates = ({
  gcsimCandidateMap,
  tableCandidateMap,
  wikiCandidateMap,
}: {
  gcsimCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  tableCandidateMap: ReadonlyMap<string, KitCandidate[]>;
  wikiCandidateMap: ReadonlyMap<string, KitCandidate[]>;
}): Map<string, KitCandidate[]> => {
  const ownGcsimCandidateMap = new Map<string, KitCandidate[]>();
  const standInCandidateMap = new Map<string, KitCandidate[]>();
  for (const [path, candidates] of gcsimCandidateMap)
    for (const candidate of candidates)
      addKitCandidate(
        checkIsNoActionFileCandidate(candidate) ? standInCandidateMap : ownGcsimCandidateMap,
        path,
        candidate,
      );
  return mergeKitCandidates(tableCandidateMap, ownGcsimCandidateMap, wikiCandidateMap, standInCandidateMap);
};
