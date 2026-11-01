import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";

// The paths a built record gets wrong against the published record it has to reproduce, those the published record
// Holds. A path only the built record holds is an addition the publish makes, which takes no overlay entry, so it is
// No gap
export const getKitGapPaths = (
  builtRecord: KitRecord,
  publishedRecord: KitRecord,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): string[] => {
  const publishedValueMap = flattenKitValues(publishedRecord);
  return getMismatchedKitPaths(builtRecord, publishedRecord, talentMultiplierMap).filter((path) =>
    publishedValueMap.has(path),
  );
};
