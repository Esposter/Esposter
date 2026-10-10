import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { ClaimDecision } from "#src/models/fleet/ClaimDecision";
import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// What `holder` does with an entry whose claim it read: adopt a live claim it holds itself, take back its own missed one
// As a fresh claim, so the miss is not carried into its next hold, leave a live or missed claim any other worker holds,
// Even one on its own machine, or take a free or stale entry. `now` is passed in, as every reading of one run is
export const getClaimDecision = (
  existingClaim: ClaimedRef | undefined,
  holder: ClaimHolder,
  now: number,
): ClaimDecision => {
  if (existingClaim === undefined) return ClaimDecision.Take;
  if (checkIsHeldBy(existingClaim.message, holder))
    return existingClaim.message.miss === undefined ? ClaimDecision.Adopt : ClaimDecision.Take;
  return getClaimStatus(existingClaim.message, now) === ClaimStatus.Stale ? ClaimDecision.Take : ClaimDecision.Held;
};
