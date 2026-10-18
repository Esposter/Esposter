import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { getReputationBountyCampId } from "#src/services/reputation/createReputationBountyCamp";

// The hunt once a defeat has been of its camp: the target is defeated, which the claim waits on. A defeat of any other
// Camp leaves the hunt as it was
export const defeatReputationBountyTarget = (hunt: ReputationBountyHunt, campId: string): ReputationBountyHunt =>
  campId === getReputationBountyCampId(hunt.bountyId) ? { ...hunt, isTargetDefeated: true } : hunt;
