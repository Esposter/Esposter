import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";

import {
  ACHIEVEMENT_GOAL_TABLE_NAME,
  ACHIEVEMENT_TABLE_NAME,
  ACHIEVEMENT_TEXT_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/achievements/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeTextChunks } from "#src/services/genshinText/writeTextChunks";
import { GameLanguages } from "genshin-text";

// Every title and description of a kept achievement, and every category's name, in every language, written into the
// World's own chunk per language by the same text ids. A language lacking a text takes English's and says so
export const writeAchievementText = (): string[] => {
  const achievementRows = readExcelTable<ExcelAchievementRow>(ACHIEVEMENT_TABLE_NAME).filter(
    ({ isDisuse }) => !isDisuse,
  );
  const textIds = [
    ...new Set(
      [
        ...achievementRows.flatMap(({ descTextMapHash, titleTextMapHash }) => [descTextMapHash, titleTextMapHash]),
        ...readExcelTable<ExcelAchievementGoalRow>(ACHIEVEMENT_GOAL_TABLE_NAME).map(
          ({ nameTextMapHash }) => nameTextMapHash,
        ),
      ].map(String),
    ),
  ].toSorted();
  const notes = writeTextChunks(ACHIEVEMENT_TEXT_GENERATED_DIRECTORY, textIds);
  notes.push(`${textIds.length} achievement texts written in ${GameLanguages.length} languages`);
  return notes;
};
