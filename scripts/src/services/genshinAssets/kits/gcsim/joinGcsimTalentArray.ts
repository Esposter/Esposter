import type { GcsimTalentArray } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentArray";
import type { TalentMultiplierMap } from "genshin-world";

// The one parameter a talent array reads, joined by value: the index and proud skill group whose multipliers at each of
// The row's levels are the row's values, across every row of the array. A row matching no parameter, or an array whose
// Rows match more than one, joins to none
export const joinGcsimTalentArray = (
  { rows }: GcsimTalentArray,
  talentMultiplierMap: TalentMultiplierMap,
  talentGroupIds: readonly number[],
): undefined | { index: number; proudSkillGroupId: number } => {
  const parameters = [...new Set(talentGroupIds)].flatMap((proudSkillGroupId) => {
    const multipliers = talentMultiplierMap[proudSkillGroupId] ?? [];
    const paramCount = Math.max(0, ...multipliers.map(({ paramList }) => paramList.length));
    return Array.from({ length: paramCount }, (_value, index) => ({ index, proudSkillGroupId }));
  });
  const matches = parameters.filter(({ index, proudSkillGroupId }) =>
    rows.every((row) =>
      row.every((value, levelIndex) => {
        const multiplier = talentMultiplierMap[proudSkillGroupId]?.find(({ level }) => level === levelIndex + 1);
        return multiplier !== undefined && (multiplier.paramList[index] ?? 0) === value;
      }),
    ),
  );
  return rows.length > 0 && matches.length === 1 ? matches[0] : undefined;
};
