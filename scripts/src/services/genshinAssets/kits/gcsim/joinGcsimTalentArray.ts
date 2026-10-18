import type { GcsimTalentArray } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentArray";
import type { TalentMultiplierMap } from "genshin-world";

// The one parameter a talent array reads, joined by value: the index and proud skill group whose multipliers at each of
// The row's levels are the row's values, across every row of the array. A row matching no parameter, or an array whose
// Rows match more than one, joins to none
export const joinGcsimTalentArray = (
  { rows }: GcsimTalentArray,
  talentMultiplierMap: TalentMultiplierMap,
  talentGroupIds: readonly number[],
): { index: number; proudSkillGroupId: number } | undefined => {
  const matchMap = new Map<string, { index: number; proudSkillGroupId: number }>();
  for (const row of rows)
    for (const proudSkillGroupId of new Set(talentGroupIds)) {
      const multipliers = talentMultiplierMap[proudSkillGroupId] ?? [];
      const paramCount = Math.max(0, ...multipliers.map(({ paramList }) => paramList.length));
      for (let index = 0; index < paramCount; index++) {
        const isMatch = row.every((value, levelIndex) => {
          const multiplier = multipliers.find(({ level }) => level === levelIndex + 1);
          return multiplier !== undefined && (multiplier.paramList[index] ?? 0) === value;
        });
        if (isMatch) matchMap.set(`${proudSkillGroupId}|${index}`, { index, proudSkillGroupId });
      }
    }
  return matchMap.size === 1 ? [...matchMap.values()][0] : undefined;
};
