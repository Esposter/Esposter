import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { reputationRewardSchema } from "#src/models/reputation/ReputationReward";
import { z } from "zod";

// One request a nation's keeper offers, by its request group: the world quest it runs as, its reward and how often it is
// Drawn against the others of its group
export interface ReputationRequest {
  groupId: number;
  questId: number;
  requestId: number;
  reward: ReputationReward;
  weight: number;
}

export const reputationRequestSchema = z.object({
  groupId: z.int().positive(),
  questId: z.int().positive(),
  requestId: z.int().positive(),
  reward: reputationRewardSchema,
  weight: z.int().positive(),
}) satisfies z.ZodType<ReputationRequest>;
