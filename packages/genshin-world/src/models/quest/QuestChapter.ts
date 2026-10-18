import type { QuestReward } from "#src/models/quest/QuestReward";

import { questRewardSchema } from "#src/models/quest/QuestReward";
import { z } from "zod";

// A series of quests the quest screen lists under one row: its title, number and region by text id, the journal finishing
// It unlocks, its quests by id in the order they are done, and the items finishing it gives. A series with no number has
// An empty number id
export interface QuestChapter {
  id: string;
  journalTextId: string;
  numberTextId: string;
  questIds: string[];
  regionTextId: string;
  rewards: QuestReward[];
  titleTextId: string;
}

export const questChapterSchema = z.object({
  id: z.string().min(1),
  journalTextId: z.string(),
  numberTextId: z.string(),
  questIds: z.array(z.string().min(1)).min(1),
  regionTextId: z.string().min(1),
  rewards: z.array(questRewardSchema),
  titleTextId: z.string(),
}) satisfies z.ZodType<QuestChapter>;
