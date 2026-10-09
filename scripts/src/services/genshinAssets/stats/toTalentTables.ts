import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { TalentLabelMap, TalentMultiplierMap } from "genshin-world";

import { talentLabelMapSchema, talentMultiplierMapSchema } from "genshin-world";

// The combat talents' multipliers and their labels, each keyed by its proud skill group and each level from the first up
// To the last. A level's parameters end at the last one that is not zero, as the world's schema reads. The labels are
// Kept apart so the multipliers a kit reads never carry them
export const toTalentTables = (
  rows: readonly ExcelProudSkillRow[],
  groupIds: ReadonlySet<number>,
): { labelMap: TalentLabelMap; multiplierMap: TalentMultiplierMap } => {
  const groups = Array.from(
    Map.groupBy(
      rows.filter(({ proudSkillGroupId }) => groupIds.has(proudSkillGroupId)),
      ({ proudSkillGroupId }) => proudSkillGroupId,
    ),
    ([proudSkillGroupId, groupRows]) => ({
      levels: groupRows
        .toSorted((firstRow, secondRow) => firstRow.level - secondRow.level)
        .map(({ level, paramDescList, paramList }) => {
          const paramCount = paramList.findLastIndex((param) => param !== 0) + 1;
          return {
            level,
            paramDescTextIds: paramDescList.slice(0, paramCount),
            paramList: paramList.slice(0, paramCount),
          };
        }),
      proudSkillGroupId,
    }),
  );
  return {
    labelMap: talentLabelMapSchema.parse(
      Object.fromEntries(
        groups.map(({ levels, proudSkillGroupId }) => [
          proudSkillGroupId,
          levels.map(({ level, paramDescTextIds }) => ({ level, paramDescTextIds })),
        ]),
      ),
    ),
    multiplierMap: talentMultiplierMapSchema.parse(
      Object.fromEntries(
        groups.map(({ levels, proudSkillGroupId }) => [
          proudSkillGroupId,
          levels.map(({ level, paramList }) => ({ level, paramList })),
        ]),
      ),
    ),
  };
};
