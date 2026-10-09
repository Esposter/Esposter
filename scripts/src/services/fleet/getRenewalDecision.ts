import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { RenewalDecision } from "#src/models/fleet/RenewalDecision";

// Whether a hold on `machine` keeps its claim, judged from the claim the remote holds now: a ref gone, a miss, or a
// Claim another machine holds each ends the hold, and only a claim this machine still holds is renewed
export const getRenewalDecision = (claim: ClaimedRef | undefined, machine: string): RenewalDecision => {
  if (claim === undefined) return RenewalDecision.Deleted;
  if (claim.message.miss !== undefined) return RenewalDecision.Missed;
  if (claim.message.machine !== machine) return RenewalDecision.TakenOver;
  return RenewalDecision.Renew;
};
