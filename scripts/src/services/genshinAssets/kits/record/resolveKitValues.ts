import type { ResolvedKitValues } from "#src/models/genshinAssets/kits/build/ResolvedKitValues";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidateSources } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidateSources";
import { checkIsCitedBy } from "#src/services/genshinAssets/kits/record/checkIsCitedBy";
import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A kit's values from its sources' candidates and its overlay: each path takes its first source's value, the overlay
// Then sets its own values, removes others and picks another source where it names one. A talent whose hits a named list
// Spawns keeps its own list empty, the named lists' hits join to their multipliers' talent variables, and the rules fill
// What is still missing over the actions and hits that leaves
export const resolveKitValues = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
  donorCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  namedHitCandidateMap: NamedHitCandidateMap,
  tables: KitTables,
  isGcsimModelled: boolean,
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
      // A choice carrying its value takes the candidate of that value, from the sources or from the join it names
      const candidates =
        entry.value === undefined
          ? sourceCandidateMap.get(path)
          : [
              ...(sourceCandidateMap.get(path) ?? []),
              ...(getNamedHitKitCandidates(new Map([[path, entry.value]]), namedHitCandidateMap).get(path) ?? []),
            ];
      const candidate = candidates?.find(
        ({ provenance, value }) =>
          provenance.source === entry.source &&
          (entry.value === undefined || checkIsKitValueResolvedEqual(value, entry.value, tables.talentMultiplierMap)) &&
          (!("file" in entry) || checkIsCitedBy(provenance, entry)),
      );
      if (candidate === undefined)
        throw new InvalidOperationError(Operation.Read, path, `has no ${entry.source} value for the overlay to choose`);
      valueMap.set(path, candidate.value);
      provenanceMap.set(path, candidate.provenance);
    } else if (entry.donor === undefined) {
      // A cause saying gcsim has no folder for the character is refused where it has one, which can read the value
      if (entry.cause === KitProvisionalCause.NoGcsimUnit && isGcsimModelled)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "names NoGcsimUnit, but gcsim has a folder for the character",
        );
      valueMap.set(path, entry.value);
      provenanceMap.set(path, { cause: entry.cause, source: KitSource.Overlay });
    } else {
      // A borrowed value takes the candidate its donor's record gives at the path the entry names
      const candidate = donorCandidateMap.get(path)?.[0];
      if (candidate === undefined)
        throw new InvalidOperationError(Operation.Read, path, "has no donor value to borrow");
      valueMap.set(path, candidate.value);
      provenanceMap.set(path, candidate.provenance);
    }
  const namedListKitCandidateMap = getNamedListKitCandidates(valueMap, tables.talentGroupIdMap);
  chooseDefaults(namedListKitCandidateMap);
  chooseDefaults(sourceCandidateMap);
  const namedHitKitCandidateMap = getNamedHitKitCandidates(valueMap, namedHitCandidateMap);
  chooseDefaults(namedHitKitCandidateMap);
  const ruleCandidateMap = getRuleKitCandidates(valueMap, tables.element);
  chooseDefaults(ruleCandidateMap);
  return {
    candidateMap: mergeKitCandidateSources({
      namedHitCandidateMap: namedHitKitCandidateMap,
      namedListCandidateMap: namedListKitCandidateMap,
      ruleCandidateMap,
      sourceCandidateMap,
    }),
    provenanceMap,
    valueMap,
  };
};
