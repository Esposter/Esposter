import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { Achievement } from "genshin-world";

import { ACHIEVEMENT_GOAL_TABLE_NAME } from "#src/services/genshinAssets/achievements/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// Every title and description of the achievements built, and every category's name, in every language, published into the
// World's own chunk per language by the same text ids. A language lacking a text takes English's and says so
export const buildAchievementText = (
  achievements: readonly Achievement[],
): { notes: string[]; objects: Record<string, unknown> } => {
  const textIds = [
    ...new Set([
      ...achievements.flatMap(({ descriptionTextId, titleTextId }) => [descriptionTextId, titleTextId]),
      ...readExcelTable<ExcelAchievementGoalRow>(ACHIEVEMENT_GOAL_TABLE_NAME).map(({ nameTextMapHash }) =>
        String(nameTextMapHash),
      ),
    ]),
  ].toSorted();
  const { notes, objects } = buildTextChunks(GameDataset.AchievementText, textIds);
  notes.push(`${textIds.length} achievement texts written in ${GameLanguages.length} languages`);
  return { notes, objects };
};
