import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";

// Whether a hold by `holder` keeps its claim, judged from the claim the remote holds now: a ref gone, a miss, or a
// Claim another worker holds each ends the hold, and only a claim this worker still holds is renewed
export const getRenewalDecision = (claim: ClaimedRef | undefined, holder: ClaimHolder): RenewalDecision => {
  if (claim === undefined) return RenewalDecision.Deleted;
  if (claim.message.miss !== undefined) return RenewalDecision.Missed;
  if (!checkIsHeldBy(claim.message, holder)) return RenewalDecision.TakenOver;
  return RenewalDecision.Renew;
};
