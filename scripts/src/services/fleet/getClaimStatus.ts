import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { STALE_MILLISECONDS } from "#src/services/fleet/constants";

// A missed claim is never stale, since the coordinator decides it; otherwise a claim unrenewed for longer than the stale
// Interval is open to takeover. `now` is passed in, so every reading in one run is taken at the same instant
export const getClaimStatus = (message: ClaimMessage, now: number): ClaimStatus => {
  if (message.miss !== undefined) return ClaimStatus.Missed;
  const renewedMilliseconds = Temporal.Instant.from(message.renewedAt).epochMilliseconds;
  return now - renewedMilliseconds > STALE_MILLISECONDS ? ClaimStatus.Stale : ClaimStatus.Held;
};
