import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { reputationRewardSchema } from "#src/models/reputation/ReputationReward";
import { z } from "zod";

// One weekly bounty of a nation's Reputation: its difficulty, the region it is hunted in and the reward its claim pays
export interface ReputationBounty {
  difficulty: string;
  id: number;
  regionId: number;
  reward: ReputationReward;
}

export const reputationBountySchema = z.object({
  difficulty: z.string().nonempty(),
  id: z.int().positive(),
  regionId: z.int().positive(),
  reward: reputationRewardSchema,
}) satisfies z.ZodType<ReputationBounty>;
