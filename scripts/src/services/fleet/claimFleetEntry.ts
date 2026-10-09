import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { InvalidOperationError, Operation } from "@esposter/shared";

export interface FleetClaimResult {
  attempt: ClaimAttempt;
  // The claim this machine now holds when it won, or the live claim another machine holds when it did not
  claimed: ClaimedRef;
}

// Takes `entry` for `machine`. A claim this machine already holds is adopted, a live one held elsewhere is returned as
// The holder, and a stale one or none is taken: a new parentless claim commit is pushed, plain when the ref is free and
// Leased from the stale commit when it is not, so exactly one machine's push lands
export const claimFleetEntry = (entry: string, machine: string, load: string): FleetClaimResult => {
  const claims = readClaimedRefs();
  const existing = claims.get(entry);
  if (existing?.message.machine === machine) return { attempt: ClaimAttempt.Won, claimed: existing };
  if (
    existing !== undefined &&
    getClaimStatus(existing.message, Temporal.Now.instant().epochMilliseconds) !== ClaimStatus.Stale
  )
    return { attempt: ClaimAttempt.Held, claimed: existing };

  const now = Temporal.Now.instant().toString();
  const message: ClaimMessage = { claimedAt: now, entry, load, machine, renewedAt: now };
  const sha = createFleetCommit(message);
  if (pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, sha, existing?.sha) === FleetPushOutcome.Pushed)
    return { attempt: ClaimAttempt.Won, claimed: { message, sha } };

  const holder = readClaimedRefs().get(entry);
  if (holder === undefined)
    throw new InvalidOperationError(
      Operation.Push,
      entry,
      "the claim was refused and is gone now, so it can be asked again",
    );
  return { attempt: ClaimAttempt.Held, claimed: holder };
};
