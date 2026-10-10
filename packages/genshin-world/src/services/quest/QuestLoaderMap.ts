import type { QuestId } from "#src/models/quest/QuestId";

import { QuestId as QuestIdValues } from "#src/models/quest/QuestId";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Each carried quest's table, the slice `pnpm -C scripts genshin:text quests` writes, fetched by its key from the hosted
// Game data. Typed over every QuestId, so a quest carried without its loader does not typecheck
export const QuestLoaderMap: Record<QuestId, (gameDataBaseUrl: string) => Promise<unknown>> = {
  [QuestIdValues.BirdsEyeView]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/352", z.unknown()),
  [QuestIdValues.WanderersTrail]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/351", z.unknown()),
};
