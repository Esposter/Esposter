import type { KitComparison } from "#src/models/genshinAssets/kits/build/KitComparison";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidateSources } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidateSources";
import { buildKitRecord } from "#src/services/genshinAssets/kits/record/buildKitRecord";
import { checkIsCitedBy } from "#src/services/genshinAssets/kits/record/checkIsCitedBy";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
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
  namedHitCandidateMap: NamedHitCandidateMap,
  tables: KitTables,
): KitComparison => {
  const publishedValueMap = flattenKitValues(publishedRecord);
  const overlay: KitOverlay = {};
  const classify = (path: string, value: unknown, candidateMap: ReadonlyMap<string, KitCandidate[]>) => {
    // A multiplier joined to its talent row names the row by its own value, so the overlay keeps the value with the
    // Source it joins to, where no source of the path gives the value itself
    const isJoinedMultiplier =
      path.endsWith(".multiplier") &&
      (candidateMap.get(path) ?? []).some(
        (candidate) => candidate.provenance.source === KitSource.Gcsim && checkIsKitValueEqual(candidate.value, value),
      ) &&
      !(sourceCandidateMap.get(path) ?? []).some(
        (candidate) => candidate.provenance.source === KitSource.Gcsim && checkIsKitValueEqual(candidate.value, value),
      );
    if (isJoinedMultiplier) {
      overlay[path] = { source: KitSource.Gcsim, value };
      return;
    }
    const committedEntry: KitOverlayEntry | undefined = committedOverlay[path];
    // A cited value whose line still gives it keeps its citation as it is
    if (
      committedEntry !== undefined &&
      "file" in committedEntry &&
      (candidateMap.get(path) ?? []).some(
        (candidate) =>
          checkIsCitedBy(candidate.provenance, committedEntry) && checkIsKitValueEqual(candidate.value, value),
      )
    ) {
      overlay[path] = committedEntry;
      return;
    }
    // A value the borrowed plunge's donor gives, where the kit holds no reason of its own, takes the donor's value, so the
    // Published one a rule gave is replaced rather than pinned
    const donor = candidateMap.get(path)?.[0]?.provenance;
    const isUnreasonedDonorValue =
      donor?.source === KitSource.Gcsim &&
      "cause" in donor &&
      donor.cause === KitProvisionalCause.NoActionFile &&
      (committedEntry === undefined ||
        !("cause" in committedEntry) ||
        committedEntry.cause === KitProvisionalCause.Unclassified);
    if (isUnreasonedDonorValue) return;
    const entry = keepCommittedKitCause(
      classifyKitValue(
        value,
        candidateMap.get(path) ?? [],
        mainCandidateMap.get(path) ?? [],
        isTagPredated,
        tables.talentMultiplierMap,
      ),
      committedEntry,
      value,
      tables.talentMultiplierMap,
    );
    // A source choice names its value where the path's first candidate of that source is another value
    const sourceChoice =
      entry !== undefined && "source" in entry
        ? sourceCandidateMap.get(path)?.find(({ provenance }) => provenance.source === entry.source)
        : undefined;
    const isValueNeeded =
      entry !== undefined &&
      "source" in entry &&
      !checkIsKitValueResolvedEqual(sourceChoice?.value, value, tables.talentMultiplierMap);
    if (entry !== undefined) overlay[path] = isValueNeeded ? { ...entry, value } : entry;
  };
  const candidateMap = mergeKitCandidateSources({
    namedHitCandidateMap: getNamedHitKitCandidates(publishedValueMap, namedHitCandidateMap),
    namedListCandidateMap: getNamedListKitCandidates(publishedValueMap, tables.talentGroupIdMap),
    ruleCandidateMap: getRuleKitCandidates(publishedValueMap, tables.element),
    sourceCandidateMap,
  });
  for (const [path, value] of publishedValueMap) classify(path, value, candidateMap);
  const resolved = resolveKitValues(sourceCandidateMap, overlay, namedHitCandidateMap, tables, !isTagPredated);
  for (const path of flattenKitValues(unflattenKitValues(resolved.valueMap)).keys())
    if (!publishedValueMap.has(path)) classify(path, undefined, resolved.candidateMap);
  return getResult(() =>
    buildKitRecord(sourceCandidateMap, overlay, namedHitCandidateMap, tables, !isTagPredated),
  ).match(
    (built): KitComparison => ({
      built,
      failures: getMismatchedKitPaths(built.record, publishedRecord, tables.talentMultiplierMap),
      overlay,
    }),
    (error): KitComparison => ({ failures: [error.message], overlay }),
  );
};
