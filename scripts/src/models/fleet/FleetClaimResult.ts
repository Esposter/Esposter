import type { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import type { ClaimedRef } from "#src/models/shared/ClaimedRef";

export interface FleetClaimResult {
  attempt: ClaimAttempt;
  // The claim this worker now holds when it won, or the live claim another worker holds when it did not
  claimed: ClaimedRef;
}
