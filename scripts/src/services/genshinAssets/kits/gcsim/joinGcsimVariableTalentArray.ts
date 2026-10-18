import type { GcsimTalentArray } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentArray";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { joinGcsimTalentArray } from "#src/services/genshinAssets/kits/gcsim/joinGcsimTalentArray";

// The parameter the talent array a variable names joins to by value, across the kit's talent groups, with the array's line
export const joinGcsimVariableTalentArray = (
  talentArrayMap: Map<string, GcsimTalentArray>,
  variable: string,
  { talentGroupIdMap, talentMultiplierMap }: Pick<KitTables, "talentGroupIdMap" | "talentMultiplierMap">,
): { line: number; multiplier: { index: number; proudSkillGroupId: number } } | undefined => {
  const talentArray = talentArrayMap.get(variable);
  if (talentArray === undefined) return undefined;
  const multiplier = joinGcsimTalentArray(talentArray, talentMultiplierMap, Object.values(talentGroupIdMap));
  return multiplier === undefined ? undefined : { line: talentArray.line, multiplier };
};
