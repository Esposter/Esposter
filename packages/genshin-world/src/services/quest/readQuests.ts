import type { Quest } from "#src/models/quest/Quest";

import { questSchema } from "#src/models/quest/Quest";
import { QuestIds } from "#src/models/quest/QuestId";
import { QuestLoaderMap } from "#src/services/quest/QuestLoaderMap";
import { z } from "zod";

// The carried quests in the order `QuestIds` names them, each read off its table and checked against the world's schema
export const readQuests = async (): Promise<Quest[]> => {
  const tables = await Promise.all(QuestIds.map(async (questId) => (await QuestLoaderMap[questId]()).default));
  return z.array(questSchema).parse(tables);
};
