import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

import { GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { kitRecordSchema } from "genshin-world";

// A kit's record from its sources' candidates and its overlay, checked against the record's schema, with how each of
// Its values is known. A value no source, rule or overlay entry accounts for fails the build
export const buildKitRecord = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
): BuiltKit => {
  const { provenanceMap, valueMap } = resolveKitValues(sourceCandidateMap, overlay);
  const record = kitRecordSchema.parse(unflattenKitValues(valueMap));
  const values: Record<string, KitValueSource> = {};
  for (const path of flattenKitValues(record).keys()) {
    const provenance = provenanceMap.get(path);
    if (provenance === undefined) throw new InvalidOperationError(Operation.Read, path, "has no source");
    values[path] = provenance;
  }
  return { record, sources: { gcsimTag: GCSIM_TAG, values } };
};
