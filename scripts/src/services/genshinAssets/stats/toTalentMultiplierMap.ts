import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { TalentMultiplierMap } from "genshin-world";

import { talentMultiplierMapSchema } from "genshin-world";

// The multipliers of the combat talents the kits name, keyed by their proud skill group, each level from the first up to
// The last. A level's parameters and their labels end at the last parameter that is not zero, as the world's schema reads
export const toTalentMultiplierMap = (
  rows: readonly ExcelProudSkillRow[],
  groupIds: ReadonlySet<number>,
): TalentMultiplierMap =>
  talentMultiplierMapSchema.parse(
    Object.fromEntries(
      Array.from(
        Map.groupBy(
          rows.filter(({ proudSkillGroupId }) => groupIds.has(proudSkillGroupId)),
          ({ proudSkillGroupId }) => proudSkillGroupId,
        ),
        ([proudSkillGroupId, groupRows]) => [
          proudSkillGroupId,
          groupRows
            .toSorted((firstRow, secondRow) => firstRow.level - secondRow.level)
            .map(({ level, paramDescList, paramList }) => {
              const paramCount = paramList.findLastIndex((param) => param !== 0) + 1;
              return {
                level,
                paramDescTextIds: paramDescList.slice(0, paramCount),
                paramList: paramList.slice(0, paramCount),
              };
            }),
        ],
      ),
    ),
  );
