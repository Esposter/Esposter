import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { kitParameterSchema } from "genshin-world";

// A table's parameter at each level its talent plays at, as the record reads it at runtime, or none where the value is
// Not a reference or its talent has no multipliers in the tables
export const readParameterLevels = (
  value: unknown,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): number[] | undefined => {
  const parameter = kitParameterSchema.safeParse(value).data;
  if (typeof parameter !== "object") return undefined;
  const rows = talentMultiplierMap[String(parameter.proudSkillGroupId)];
  return rows === undefined || rows.length === 0
    ? undefined
    : rows.map(({ paramList }) => paramList[parameter.index] ?? 0);
};
