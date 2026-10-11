import type { ResolvedKitValues } from "#src/models/genshinAssets/kits/build/ResolvedKitValues";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A kit's values from its sources' candidates and its overlay: each path takes its first source's value, the overlay
// Then sets its own values, removes others and picks another source where it names one, and the rules fill what is
// Still missing over the actions and hits that leaves
export const resolveKitValues = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
): ResolvedKitValues => {
  const valueMap = new Map<string, unknown>();
  const provenanceMap = new Map<string, KitValueSource>();
  const chooseDefaults = (candidateMap: ReadonlyMap<string, KitCandidate[]>) => {
    for (const [path, [candidate]] of candidateMap) {
      if (candidate === undefined || valueMap.has(path)) continue;
      valueMap.set(path, candidate.value);
      provenanceMap.set(path, candidate.provenance);
    }
  };
  for (const [path, entry] of Object.entries(overlay))
    if ("source" in entry) {
      const candidate = sourceCandidateMap.get(path)?.find(({ provenance }) => provenance.source === entry.source);
      if (candidate === undefined)
        throw new InvalidOperationError(Operation.Read, path, `has no ${entry.source} value for the overlay to choose`);
      valueMap.set(path, candidate.value);
      provenanceMap.set(path, candidate.provenance);
    } else {
      valueMap.set(path, entry.value);
      provenanceMap.set(path, { cause: entry.cause, source: KitSource.Overlay });
    }
  chooseDefaults(sourceCandidateMap);
  const ruleCandidateMap = getRuleKitCandidates(valueMap);
  chooseDefaults(ruleCandidateMap);
  return { candidateMap: mergeKitCandidates(sourceCandidateMap, ruleCandidateMap), provenanceMap, valueMap };
};
