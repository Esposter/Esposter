import type { KitRecord } from "genshin-world";

import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";

// Every path where a built record and its published record hold different values, either one holding none
export const getMismatchedKitPaths = (builtRecord: KitRecord, publishedRecord: KitRecord): string[] => {
  const builtValueMap = flattenKitValues(builtRecord);
  const publishedValueMap = flattenKitValues(publishedRecord);
  return [...new Set([...builtValueMap.keys(), ...publishedValueMap.keys()])].filter(
    (path) => !checkIsKitValueEqual(builtValueMap.get(path), publishedValueMap.get(path)),
  );
};
