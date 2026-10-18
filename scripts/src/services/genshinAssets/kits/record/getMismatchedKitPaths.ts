import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";

// Every path where a built record and its published record hold different values, either one holding none. A table's
// Reference is compared as the number it reads at every level, as the compare reads it, so two references that read
// The same are no mismatch
export const getMismatchedKitPaths = (
  builtRecord: KitRecord,
  publishedRecord: KitRecord,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] => {
  const builtValueMap = flattenKitValues(builtRecord);
  const publishedValueMap = flattenKitValues(publishedRecord);
  return [...new Set([...builtValueMap.keys(), ...publishedValueMap.keys()])].filter(
    (path) => !checkIsKitValueResolvedEqual(builtValueMap.get(path), publishedValueMap.get(path), talentMultiplierMap),
  );
};
