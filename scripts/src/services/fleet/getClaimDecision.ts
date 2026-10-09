import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { ClaimDecision } from "#src/models/fleet/ClaimDecision";
import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// What `holder` does with an entry whose claim it read: adopt a claim it holds itself, leave a live claim held by any
// Other worker, even one on its own machine, or take a free or stale entry. `now` is passed in, as every reading of one run is
export const getClaimDecision = (
  existingClaim: ClaimedRef | undefined,
  holder: ClaimHolder,
  now: number,
): ClaimDecision => {
  if (existingClaim === undefined) return ClaimDecision.Take;
  if (checkIsHeldBy(existingClaim.message, holder)) return ClaimDecision.Adopt;
  return getClaimStatus(existingClaim.message, now) === ClaimStatus.Stale ? ClaimDecision.Take : ClaimDecision.Held;
};
