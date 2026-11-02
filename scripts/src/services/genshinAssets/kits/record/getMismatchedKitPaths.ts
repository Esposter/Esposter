import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { getMismatchedValuePaths } from "#src/services/genshinAssets/kits/record/getMismatchedValuePaths";

// Every path where a built record and its published record hold different values, either one holding none. A table's
// Reference is compared as the number it reads at every level, as the compare reads it, so two references that read
// The same are no mismatch
export const getMismatchedKitPaths = (
  builtRecord: KitRecord,
  publishedRecord: KitRecord,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] =>
  getMismatchedValuePaths(flattenKitValues(builtRecord), flattenKitValues(publishedRecord), talentMultiplierMap);
