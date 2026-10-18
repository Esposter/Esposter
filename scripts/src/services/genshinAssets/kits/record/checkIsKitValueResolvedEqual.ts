import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitParameter } from "genshin-world";

import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { kitParameterSchema } from "genshin-world";

// A table's parameter at each level its talent plays at, as the record reads it at runtime, or none where the value is
// Not a reference or its talent has no multipliers in the tables
const readParameterLevels = (
  value: unknown,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): number[] | undefined => {
  if (typeof value !== "object" || value === null || !kitParameterSchema.safeParse(value).success) return undefined;
  const { index, proudSkillGroupId } = value as Extract<KitParameter, object>;
  const rows = talentMultiplierMap[String(proudSkillGroupId)];
  return rows === undefined || rows.length === 0 ? undefined : rows.map(({ paramList }) => paramList[index] ?? 0);
};

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
