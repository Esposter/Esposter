import type { ReputationBounty } from "#src/models/reputation/ReputationBounty";
import type { ReputationBountyTarget } from "#src/models/reputation/ReputationBountyTarget";
import type { ReputationExplore } from "#src/models/reputation/ReputationExplore";
import type { ReputationHuntingRegion } from "#src/models/reputation/ReputationHuntingRegion";
import type { ReputationLevel } from "#src/models/reputation/ReputationLevel";
import type { ReputationQuest } from "#src/models/reputation/ReputationQuest";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

import { reputationBountySchema } from "#src/models/reputation/ReputationBounty";
import { reputationBountyTargetSchema } from "#src/models/reputation/ReputationBountyTarget";
import { reputationExploreSchema } from "#src/models/reputation/ReputationExplore";
import { reputationHuntingRegionSchema } from "#src/models/reputation/ReputationHuntingRegion";
import { reputationLevelSchema } from "#src/models/reputation/ReputationLevel";
import { reputationQuestSchema } from "#src/models/reputation/ReputationQuest";
import { reputationRequestSchema } from "#src/models/reputation/ReputationRequest";
import { z } from "zod";

// One nation's Reputation as its slice holds it: its levels, the requests its keeper offers from each level's group, the
// Quests that pay it once they finish, its weekly bounties with the kinds each difficulty's target may be, the hunting
// Regions they spawn in, and the exploration thresholds that pay it
export interface ReputationCity {
  bounties: ReputationBounty[];
  bountyTargets: ReputationBountyTarget[];
  explores: ReputationExplore[];
  huntingRegions: ReputationHuntingRegion[];
  levels: ReputationLevel[];
  quests: ReputationQuest[];
  requests: ReputationRequest[];
}

export const reputationCitySchema = z.object({
  bounties: z.array(reputationBountySchema),
  bountyTargets: z.array(reputationBountyTargetSchema),
  explores: z.array(reputationExploreSchema),
  huntingRegions: z.array(reputationHuntingRegionSchema),
  levels: z.array(reputationLevelSchema),
  quests: z.array(reputationQuestSchema),
  requests: z.array(reputationRequestSchema),
}) satisfies z.ZodType<ReputationCity>;
