import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";

// The same comparison over records already flattened, so a caller holding both maps walks each record once
export const getMismatchedValuePaths = (
  builtValueMap: ReadonlyMap<string, unknown>,
  publishedValueMap: ReadonlyMap<string, unknown>,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] =>
  [...new Set([...builtValueMap.keys(), ...publishedValueMap.keys()])].filter(
    (path) => !checkIsKitValueResolvedEqual(builtValueMap.get(path), publishedValueMap.get(path), talentMultiplierMap),
  );

// Every path where a built record and its published record hold different values, either one holding none. A table's
// Reference is compared as the number it reads at every level, as the compare reads it, so two references that read
// The same are no mismatch
export const getMismatchedKitPaths = (
  builtRecord: KitRecord,
  publishedRecord: KitRecord,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] =>
  getMismatchedValuePaths(flattenKitValues(builtRecord), flattenKitValues(publishedRecord), talentMultiplierMap);
