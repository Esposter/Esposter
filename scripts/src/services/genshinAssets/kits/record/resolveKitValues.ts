import type { ResolvedKitValues } from "#src/models/genshinAssets/kits/build/ResolvedKitValues";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A kit's values from its sources' candidates and its overlay: each path takes its first source's value, the overlay
// Then sets its own values, removes others and picks another source where it names one. A talent whose hits a named list
// Spawns keeps its own list empty, the named lists' hits join to their multipliers' talent variables, and the rules fill
// What is still missing over the actions and hits that leaves
export const resolveKitValues = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
  namedHitCandidateMap: NamedHitCandidateMap,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
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
  const namedListKitCandidateMap = getNamedListKitCandidates(valueMap, talentGroupIdMap);
  chooseDefaults(namedListKitCandidateMap);
  chooseDefaults(sourceCandidateMap);
  const namedHitKitCandidateMap = getNamedHitKitCandidates(valueMap, namedHitCandidateMap);
  chooseDefaults(namedHitKitCandidateMap);
  const ruleCandidateMap = getRuleKitCandidates(valueMap);
  chooseDefaults(ruleCandidateMap);
  return {
    candidateMap: mergeKitCandidates(
      namedListKitCandidateMap,
      sourceCandidateMap,
      namedHitKitCandidateMap,
      ruleCandidateMap,
    ),
    provenanceMap,
    valueMap,
  };
};
