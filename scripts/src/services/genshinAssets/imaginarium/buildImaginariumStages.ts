import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";

import { fetchEnemyWikiPages } from "#src/services/genshinAssets/enemies/fetchEnemyWikiPages";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { ROLE_COMBAT_SCHEDULE_TABLE_NAME } from "#src/services/genshinAssets/imaginarium/constants";
import { ExcelRoleCombatScheduleRowFieldDumpKeyMap } from "#src/services/genshinAssets/imaginarium/ExcelRoleCombatScheduleRowFieldDumpKeyMap";
import { fetchImaginariumSeasonTitles } from "#src/services/genshinAssets/imaginarium/fetchImaginariumSeasonTitles";
import { parseWikiImaginariumStages } from "#src/services/genshinAssets/imaginarium/parseWikiImaginariumStages";
import { toImaginariumStage } from "#src/services/genshinAssets/imaginarium/toImaginariumStage";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The Easy stages of every season the wiki has written up, joined to the season the schedule begins on the page's day, and
// Each stage's enemy names resolved to monsters by exact name, the refusals listed on the stage. The pages come through the
// Wiki cache, each fetched there once
export const buildImaginariumStages = async (): Promise<Record<string, unknown>> => {
  const beginDaySeasonIdMap = new Map(
    readExcelTable<ExcelRoleCombatScheduleRow>(
      ROLE_COMBAT_SCHEDULE_TABLE_NAME,
      ExcelRoleCombatScheduleRowFieldDumpKeyMap,
    ).map(({ beginTimeStr, scheduleId }) => [beginTimeStr.slice(0, 10), scheduleId]),
  );
  const titles = await fetchImaginariumSeasonTitles();
  await fetchEnemyWikiPages(titles, false);
  const monsters = readMonsterNames();
  const stages = titles.flatMap((title) => {
    const seasonId = beginDaySeasonIdMap.get(title.slice(-10));
    if (seasonId === undefined)
      throw new InvalidOperationError(Operation.Read, title, "is the page of no season the schedule begins that day");
    return parseWikiImaginariumStages(readWikiPageContent(title)).map((stage) =>
      toImaginariumStage(stage, seasonId, monsters),
    );
  });
  return { [`${GameDataset.Imaginarium}/stages`]: stages };
};
