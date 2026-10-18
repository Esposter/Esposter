import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { reputationRewardSchema } from "#src/models/reputation/ReputationReward";
import { z } from "zod";

// A Reputation quest of a nation: the quest its parent names, which pays its reward once that quest finishes
export interface ReputationQuest {
  questId: number;
  reward: ReputationReward;
}

export const reputationQuestSchema = z.object({
  questId: z.int().positive(),
  reward: reputationRewardSchema,
}) satisfies z.ZodType<ReputationQuest>;
