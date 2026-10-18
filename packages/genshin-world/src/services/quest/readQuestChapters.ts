import type { QuestChapter } from "#src/models/quest/QuestChapter";

import { questChapterSchema } from "#src/models/quest/QuestChapter";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The carried series, each one listed on the quest screen under its title and number, read from the hosted game data as
// `pnpm -C scripts genshin:text quests` writes them, and checked against the world's schema as they arrive
export const readQuestChapters = (gameDataBaseUrl: string): Promise<QuestChapter[]> =>
  readGameData(gameDataBaseUrl, "quests/chapters", z.array(questChapterSchema));
