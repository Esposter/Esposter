import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";
import type { ClaimedRef } from "#src/models/shared/ClaimedRef";

import { ClaimDecision } from "#src/models/fleet/ClaimDecision";
import { ClaimStatus } from "#src/models/shared/ClaimStatus";
import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// What `holder` does with an entry whose claim it read: adopt a live claim it holds itself. A stale claim is taken under
// Its lease whoever holds it, since nothing renews it, and so is a missed one it holds itself, as a fresh claim, so the
// Miss is not carried into its next hold. A live or missed claim any other worker holds is left, even one on its own
// Machine, and a free entry is taken. `now` is passed in, as every reading of one run is
export const getClaimDecision = (
  existingClaim: ClaimedRef | undefined,
  holder: ClaimHolder,
  now: number,
): ClaimDecision => {
  if (existingClaim === undefined) return ClaimDecision.Take;
  const status = getClaimStatus(existingClaim.message, now);
  if (status === ClaimStatus.Stale) return ClaimDecision.Take;
  if (!checkIsHeldBy(existingClaim.message, holder)) return ClaimDecision.Held;
  return status === ClaimStatus.Missed ? ClaimDecision.Take : ClaimDecision.Adopt;
};
