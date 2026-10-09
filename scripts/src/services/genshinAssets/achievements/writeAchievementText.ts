import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";

import {
  ACHIEVEMENT_GOAL_TABLE_NAME,
  ACHIEVEMENT_TABLE_NAME,
  ACHIEVEMENT_TEXT_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/achievements/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage, GameLanguages } from "genshin-text";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every title and description of a kept achievement, and every category's name, in every language, written into the
// World's own chunk per language by the same text ids. A language lacking a text takes English's and says so
export const writeAchievementText = (): string[] => {
  const notes: string[] = [];
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
  const englishTextMap = readTextMap(GameLanguage.English);
  // Every language is read before the last run's chunks are removed, so a text map that fails to read leaves them
  const languageTexts = GameLanguages.map((language) => {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    const text = Object.fromEntries(
      textIds.map((textId) => {
        const gameText = textMap.get(textId);
        if (!gameText) notes.push(`${textId} has no ${language} text; English stands in`);
        return [textId, getPlainGameText(gameText || (englishTextMap.get(textId) ?? ""))];
      }),
    );
    return [language, text] as const;
  });
  rmSync(ACHIEVEMENT_TEXT_GENERATED_DIRECTORY, { force: true, recursive: true });
  mkdirSync(ACHIEVEMENT_TEXT_GENERATED_DIRECTORY, { recursive: true });
  for (const [language, text] of languageTexts)
    writeFileSync(join(ACHIEVEMENT_TEXT_GENERATED_DIRECTORY, `${language}.json`), JSON.stringify(text));

  notes.push(`${textIds.length} achievement texts written in ${GameLanguages.length} languages`);
  return notes;
};
