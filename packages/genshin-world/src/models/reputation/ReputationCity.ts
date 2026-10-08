import type { ReputationBounty } from "#src/models/reputation/ReputationBounty";
import type { ReputationLevel } from "#src/models/reputation/ReputationLevel";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

import { reputationBountySchema } from "#src/models/reputation/ReputationBounty";
import { reputationLevelSchema } from "#src/models/reputation/ReputationLevel";
import { reputationRequestSchema } from "#src/models/reputation/ReputationRequest";
import { z } from "zod";

// One nation's Reputation as its slice holds it: its levels, the requests its keeper offers from each level's group, and
// Its weekly bounties
export interface ReputationCity {
  bounties: ReputationBounty[];
  levels: ReputationLevel[];
  requests: ReputationRequest[];
}

export const reputationCitySchema = z.object({
  bounties: z.array(reputationBountySchema),
  levels: z.array(reputationLevelSchema),
  requests: z.array(reputationRequestSchema),
}) satisfies z.ZodType<ReputationCity>;
