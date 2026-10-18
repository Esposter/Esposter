import type { ReputationBounty } from "#src/models/reputation/ReputationBounty";
import type { ReputationBountyTarget } from "#src/models/reputation/ReputationBountyTarget";
import type { ReputationExplore } from "#src/models/reputation/ReputationExplore";
import type { ReputationHuntingRegion } from "#src/models/reputation/ReputationHuntingRegion";
import type { ReputationLevel } from "#src/models/reputation/ReputationLevel";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

import { reputationBountySchema } from "#src/models/reputation/ReputationBounty";
import { reputationBountyTargetSchema } from "#src/models/reputation/ReputationBountyTarget";
import { reputationExploreSchema } from "#src/models/reputation/ReputationExplore";
import { reputationHuntingRegionSchema } from "#src/models/reputation/ReputationHuntingRegion";
import { reputationLevelSchema } from "#src/models/reputation/ReputationLevel";
import { reputationRequestSchema } from "#src/models/reputation/ReputationRequest";
import { z } from "zod";

// One nation's Reputation as its slice holds it: its levels, the requests its keeper offers from each level's group, its
// Weekly bounties with the kinds each difficulty's target may be, the hunting regions they spawn in, and the exploration
// Thresholds that pay it
export interface ReputationCity {
  bountyTargets: ReputationBountyTarget[];
  bounties: ReputationBounty[];
  explores: ReputationExplore[];
  huntingRegions: ReputationHuntingRegion[];
  levels: ReputationLevel[];
  requests: ReputationRequest[];
}

export const reputationCitySchema = z.object({
  bountyTargets: z.array(reputationBountyTargetSchema),
  bounties: z.array(reputationBountySchema),
  explores: z.array(reputationExploreSchema),
  huntingRegions: z.array(reputationHuntingRegionSchema),
  levels: z.array(reputationLevelSchema),
  requests: z.array(reputationRequestSchema),
}) satisfies z.ZodType<ReputationCity>;
