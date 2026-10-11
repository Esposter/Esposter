import type { KitRecord } from "genshin-world";

import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";

// Every path where a built record and its module's record hold different values, either one holding none
export const getMismatchedKitPaths = (builtRecord: KitRecord, moduleRecord: KitRecord): string[] => {
  const builtValueMap = flattenKitValues(builtRecord);
  const moduleValueMap = flattenKitValues(moduleRecord);
  return [...new Set([...builtValueMap.keys(), ...moduleValueMap.keys()])].filter(
    (path) => !checkIsKitValueEqual(builtValueMap.get(path), moduleValueMap.get(path)),
  );
};
