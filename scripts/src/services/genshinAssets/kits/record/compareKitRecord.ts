import type { KitComparison } from "#src/models/genshinAssets/kits/build/KitComparison";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { KitRecord } from "genshin-world";

import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidates } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidates";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { keepCommittedKitCause } from "#src/services/genshinAssets/kits/record/keepCommittedKitCause";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { getResult } from "@esposter/shared";

// The overlay a kit's published record needs for its sources to reproduce it, each entry classified: first every value
// The record holds, against its sources and the rules over the record's own actions and hits, then every value the
// Build would still give that the record lacks. The build from the overlay is then checked value by value against it.
// A cause the committed overlay holds is kept while its value stands, as keepCommittedKitCause keeps it
export const compareKitRecord = (
  publishedRecord: KitRecord,
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  mainCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  isTagPredated: boolean,
  committedOverlay: KitOverlay,
): KitComparison => {
  const publishedValueMap = flattenKitValues(publishedRecord);
  const overlay: KitOverlay = {};
  const classify = (path: string, value: unknown, candidateMap: ReadonlyMap<string, KitCandidate[]>) => {
    const committedEntry: KitOverlayEntry | undefined = committedOverlay[path];
    const entry = keepCommittedKitCause(
      classifyKitValue(value, candidateMap.get(path) ?? [], mainCandidateMap.get(path) ?? [], isTagPredated),
      committedEntry,
      value,
    );
    if (entry !== undefined) overlay[path] = entry;
  };
  const candidateMap = mergeKitCandidates(sourceCandidateMap, getRuleKitCandidates(publishedValueMap));
  for (const [path, value] of publishedValueMap) classify(path, value, candidateMap);
  const resolved = resolveKitValues(sourceCandidateMap, overlay);
  for (const path of flattenKitValues(unflattenKitValues(resolved.valueMap)).keys())
    if (!publishedValueMap.has(path)) classify(path, undefined, resolved.candidateMap);
  return getResult(() => buildKitRecord(sourceCandidateMap, overlay)).match(
    (built): KitComparison => ({ built, failures: getMismatchedKitPaths(built.record, publishedRecord), overlay }),
    (error): KitComparison => ({ failures: [error.message], overlay }),
  );
};
