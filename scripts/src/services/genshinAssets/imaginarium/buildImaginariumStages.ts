import type { AnimalCodexRow } from "#src/models/genshinAssets/enemies/AnimalCodexRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";

import { ANIMAL_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { checkHasBaseCurves } from "#src/services/genshinAssets/enemies/checkHasBaseCurves";
import { MONSTER_TABLE_NAME } from "#src/services/genshinAssets/enemies/constants";
import { findCanonicalMonsterRow } from "#src/services/genshinAssets/enemies/findCanonicalMonsterRow";
import { readEnemyWikiPages } from "#src/services/genshinAssets/enemies/readEnemyWikiPages";
import { readMonsterCurveRows } from "#src/services/genshinAssets/enemies/readMonsterCurveRows";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { toLevelCurves } from "#src/services/genshinAssets/enemies/toLevelCurves";
import { ROLE_COMBAT_SCHEDULE_TABLE_NAME } from "#src/services/genshinAssets/imaginarium/constants";
import { ExcelRoleCombatScheduleRowFieldDumpKeyMap } from "#src/services/genshinAssets/imaginarium/ExcelRoleCombatScheduleRowFieldDumpKeyMap";
import { parseWikiImaginariumStages } from "#src/services/genshinAssets/imaginarium/parseWikiImaginariumStages";
import { readImaginariumSeasonTitles } from "#src/services/genshinAssets/imaginarium/readImaginariumSeasonTitles";
import { toImaginariumStage } from "#src/services/genshinAssets/imaginarium/toImaginariumStage";
import { toImaginariumStageEnemy } from "#src/services/genshinAssets/imaginarium/toImaginariumStageEnemy";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world/definitions";

// The Easy stages of every season the wiki has written up, joined to the season the schedule begins on the page's day,
// And each stage's enemy names resolved to the monster their codex entry names, with its stats at the stage's level,
// And the refusals listed on the stage. The pages come through the wiki cache, each fetched there once
export const buildImaginariumStages = async (): Promise<Record<string, unknown>> => {
  const beginDaySeasonIdMap = new Map(
    readExcelTable<ExcelRoleCombatScheduleRow>(
      ROLE_COMBAT_SCHEDULE_TABLE_NAME,
      ExcelRoleCombatScheduleRowFieldDumpKeyMap,
    ).map(({ beginTimeStr, scheduleId }) => [beginTimeStr.slice(0, 10), scheduleId]),
  );
  const titles = await readImaginariumSeasonTitles();
  await readEnemyWikiPages(titles, false);
  const monsters = readMonsterNames();
  const monsterRows = readExcelTable<MonsterRow>(MONSTER_TABLE_NAME);
  const animalCodexRows = readExcelTable<AnimalCodexRow>(ANIMAL_CODEX_TABLE_NAME);
  const levelCurves = toLevelCurves(readMonsterCurveRows());
  const stages = titles.flatMap((title) => {
    const seasonId = beginDaySeasonIdMap.get(title.slice(-10));
    if (seasonId === undefined)
      throw new InvalidOperationError(Operation.Read, title, "is the page of no season the schedule begins that day");
    return parseWikiImaginariumStages(readWikiPageContent(title)).map((stage) =>
      toImaginariumStage(stage, seasonId, monsters, (describeId) => {
        const monsterRow = findCanonicalMonsterRow(animalCodexRows, monsterRows, describeId);
        return monsterRow && checkHasBaseCurves(monsterRow)
          ? toImaginariumStageEnemy(monsterRow, stage.easyLevel, levelCurves)
          : undefined;
      }),
    );
  });
  return { [`${GameDataset.Imaginarium}/stages`]: stages };
};
