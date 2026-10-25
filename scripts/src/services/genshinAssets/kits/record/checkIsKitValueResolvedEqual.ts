import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { readParameterLevels } from "#src/services/genshinAssets/kits/record/readParameterLevels";

// Whether two values of a kit's record are the same value once a table's parameter is read at every level its talent
// Plays at, so a reference equals the number, or the other reference, it reads as at each level. A value that is not a
// Reference is compared as checkIsKitValueEqual compares it
export const checkIsKitValueResolvedEqual = (
  left: unknown,
  right: unknown,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): boolean => {
  if (checkIsKitValueEqual(left, right)) return true;
  const leftLevels = readParameterLevels(left, talentMultiplierMap);
  const rightLevels = readParameterLevels(right, talentMultiplierMap);
  if (leftLevels !== undefined && rightLevels !== undefined)
    return leftLevels.length === rightLevels.length && leftLevels.every((level, index) => level === rightLevels[index]);
  if (leftLevels !== undefined && typeof right === "number") return leftLevels.every((level) => level === right);
  if (rightLevels !== undefined && typeof left === "number") return rightLevels.every((level) => level === left);
  return false;
};
