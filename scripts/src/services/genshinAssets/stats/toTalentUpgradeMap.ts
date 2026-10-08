import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { TalentUpgradeMap } from "genshin-world";

import { EMPTY_ITEM_ID, MAX_MATERIAL_TALENT_LEVEL } from "#src/services/genshinAssets/stats/constants";
import { TALENT_START_LEVEL, talentUpgradeMapSchema } from "genshin-world";

// The upgrades of the combat talents the kits name, keyed by their proud skill group: each level from the second up to
// The last one the materials raise, with its phase, Mora and items. A level past that is a constellation's, which no
// Material raises, and a cost slot holding nothing is left out
export const toTalentUpgradeMap = (
  rows: readonly ExcelProudSkillRow[],
  groupIds: ReadonlySet<number>,
): TalentUpgradeMap =>
  talentUpgradeMapSchema.parse(
    Object.fromEntries(
      Array.from(
        Map.groupBy(
          rows.filter(
            ({ level, proudSkillGroupId }) =>
              groupIds.has(proudSkillGroupId) && level > TALENT_START_LEVEL && level <= MAX_MATERIAL_TALENT_LEVEL,
          ),
          ({ proudSkillGroupId }) => proudSkillGroupId,
        ),
        ([proudSkillGroupId, groupRows]) => [
          proudSkillGroupId,
          groupRows
            .toSorted((firstRow, secondRow) => firstRow.level - secondRow.level)
            .map(({ breakLevel, coinCost, costItems, level }) => ({
              coinCost,
              costItems: costItems.filter(({ count, id }) => count > 0 && id !== EMPTY_ITEM_ID),
              level,
              phase: breakLevel,
            })),
        ],
      ),
    ),
  );
