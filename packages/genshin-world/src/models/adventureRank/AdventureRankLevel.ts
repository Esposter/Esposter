import type { QuestRewardItem } from "#src/models/quest/Quest";

import { questRewardItemSchema } from "#src/models/quest/Quest";
import { z } from "zod";

// One rank of the game's player level table: the Adventure EXP that takes the player from it to the next, and the items
// Its reward pays once the rank is reached, which a rank with no reward holds empty
export interface AdventureRankLevel {
  exp: number;
  level: number;
  rewardItems: QuestRewardItem[];
}

export const adventureRankLevelSchema = z.object({
  exp: z.int().nonnegative(),
  level: z.int().min(1),
  rewardItems: z.array(questRewardItemSchema),
}) satisfies z.ZodType<AdventureRankLevel>;
