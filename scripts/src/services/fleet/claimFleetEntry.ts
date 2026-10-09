import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";
import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { ClaimDecision } from "#src/models/fleet/ClaimDecision";
import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { getClaimDecision } from "#src/services/fleet/getClaimDecision";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { InvalidOperationError, Operation } from "@esposter/shared";

export interface FleetClaimResult {
  attempt: ClaimAttempt;
  // The claim this worker now holds when it won, or the live claim another worker holds when it did not
  claimed: ClaimedRef;
}

// Takes `entry` for `holder`. A claim this worker already holds is adopted, a live one held by any other worker, even on
// The same machine, is returned as the holder, and a stale one or none is taken: a new parentless claim commit is pushed,
// Plain when the ref is free and leased from the stale commit when it is not, so exactly one worker's push lands
export const claimFleetEntry = (entry: string, holder: ClaimHolder, load: string): FleetClaimResult => {
  const claims = readClaimedRefs();
  const existingClaim = claims.get(entry);
  const decision = getClaimDecision(existingClaim, holder, Temporal.Now.instant().epochMilliseconds);
  if (existingClaim !== undefined && decision === ClaimDecision.Adopt)
    return { attempt: ClaimAttempt.Won, claimed: existingClaim };
  if (existingClaim !== undefined && decision === ClaimDecision.Held)
    return { attempt: ClaimAttempt.Held, claimed: existingClaim };

  const now = Temporal.Now.instant().toString();
  const message: ClaimMessage = {
    claimedAt: now,
    entry,
    load,
    machine: holder.machine,
    renewedAt: now,
    worker: holder.worker,
  };
  const sha = createFleetCommit(message);
  if (pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, sha, existingClaim?.sha) === FleetPushOutcome.Pushed)
    return { attempt: ClaimAttempt.Won, claimed: { message, sha } };

  const currentClaim = readClaimedRefs().get(entry);
  if (currentClaim === undefined)
    throw new InvalidOperationError(
      Operation.Push,
      entry,
      "the claim was refused and is gone now, so it can be asked again",
    );
  return { attempt: ClaimAttempt.Held, claimed: currentClaim };
};
