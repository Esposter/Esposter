import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { kitSourcesSchema } from "#src/models/genshinAssets/kits/KitSources";
import { GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { kitRecordSchema } from "genshin-world";

// A kit's record from its sources' candidates and its overlay, with how each of its values is known, both checked
// Against their schemas as both are published. A value no source, rule or overlay entry accounts for fails the build
export const buildKitRecord = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
  namedHitCandidateMap: NamedHitCandidateMap,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
  isGcsimModelled: boolean,
): BuiltKit => {
  const { provenanceMap, valueMap } = resolveKitValues(
    sourceCandidateMap,
    overlay,
    namedHitCandidateMap,
    talentGroupIdMap,
    isGcsimModelled,
  );
  const record = kitRecordSchema.parse(unflattenKitValues(valueMap));
  const values: Record<string, KitValueSource> = {};
  for (const path of flattenKitValues(record).keys()) {
    const provenance = provenanceMap.get(path);
    if (provenance === undefined) throw new InvalidOperationError(Operation.Read, path, "has no source");
    values[path] = provenance;
  }
  return { record, sources: kitSourcesSchema.parse({ gcsimTag: GCSIM_TAG, values }) };
};
