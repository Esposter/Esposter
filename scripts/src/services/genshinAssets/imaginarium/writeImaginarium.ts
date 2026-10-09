import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";

import {
  IMAGINARIUM_DIFFICULTIES_PATH,
  IMAGINARIUM_GENERATED_DIRECTORY,
  IMAGINARIUM_SEASONS_PATH,
  ROLE_COMBAT_DIFFICULTY_TABLE_NAME,
  ROLE_COMBAT_SCHEDULE_TABLE_NAME,
} from "#src/services/genshinAssets/imaginarium/constants";
import { toImaginariumDifficulty } from "#src/services/genshinAssets/imaginarium/toImaginariumDifficulty";
import { toImaginariumSeason } from "#src/services/genshinAssets/imaginarium/toImaginariumSeason";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

// The Imaginarium Theater's seasons and difficulties from the role combat tables, each written as a slice in the world's
// Generated folder. A season names its difficulties by id, and a season naming one the difficulty table lacks is refused
export const writeImaginarium = (): void => {
  const difficulties = readExcelTable<ExcelRoleCombatDifficultyRow>(ROLE_COMBAT_DIFFICULTY_TABLE_NAME)
    .map((row) => toImaginariumDifficulty(row))
    .toSorted((firstDifficulty, secondDifficulty) => firstDifficulty.id - secondDifficulty.id);
  const difficultyIds = new Set(difficulties.map(({ id }) => id));
  const seasons = readExcelTable<ExcelRoleCombatScheduleRow>(ROLE_COMBAT_SCHEDULE_TABLE_NAME)
    .map((row) => toImaginariumSeason(row))
    .toSorted((firstSeason, secondSeason) => firstSeason.id - secondSeason.id);
  for (const season of seasons) {
    const missingId = season.difficultyIds.find((id) => !difficultyIds.has(id));
    if (missingId !== undefined)
      throw new InvalidOperationError(
        Operation.Read,
        String(season.id),
        `names difficulty ${missingId}, which the table lacks`,
      );
  }
  mkdirSync(IMAGINARIUM_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(IMAGINARIUM_SEASONS_PATH, `${JSON.stringify(seasons)}\n`);
  writeFileSync(IMAGINARIUM_DIFFICULTIES_PATH, `${JSON.stringify(difficulties)}\n`);
};
