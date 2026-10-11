import type { KitComparison } from "#src/models/genshinAssets/kits/build/KitComparison";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitRecord } from "genshin-world";

import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { getResult } from "@esposter/shared";

// The overlay a kit module needs for its sources to reproduce it, each entry classified: first every value the module
// Holds, against its sources and the rules over the module's own actions and hits, then every value the build would
// Still give that the module lacks. The build from the overlay is then checked value by value against the module
export const compareKitRecord = (
  moduleRecord: KitRecord,
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  mainCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  isTagPredated: boolean,
): KitComparison => {
  const moduleValueMap = flattenKitValues(moduleRecord);
  const overlay: KitOverlay = {};
  const classify = (path: string, value: unknown, candidateMap: ReadonlyMap<string, KitCandidate[]>) => {
    const entry = classifyKitValue(
      value,
      candidateMap.get(path) ?? [],
      mainCandidateMap.get(path) ?? [],
      isTagPredated,
    );
    if (entry !== undefined) overlay[path] = entry;
  };
  const candidateMap = mergeKitCandidates(sourceCandidateMap, getRuleKitCandidates(moduleValueMap));
  for (const [path, value] of moduleValueMap) classify(path, value, candidateMap);
  const resolved = resolveKitValues(sourceCandidateMap, overlay);
  for (const path of flattenKitValues(unflattenKitValues(resolved.valueMap)).keys())
    if (!moduleValueMap.has(path)) classify(path, undefined, resolved.candidateMap);
  return getResult(() => buildKitRecord(sourceCandidateMap, overlay)).match(
    (built): KitComparison => ({ built, failures: getMismatchedKitPaths(built.record, moduleRecord), overlay }),
    (error): KitComparison => ({ failures: [error.message], overlay }),
  );
};
