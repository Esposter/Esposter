import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Writes the miss over a claim this machine holds, keeping the claim so the stale takeover never takes it: the entry
// Waits for the coordinator's call. The miss is the holder's message on a new commit, leased from the commit it read
export const missFleetEntry = (entry: string, miss: string): void => {
  const claimed = readClaimedRefs().get(entry);
  if (claimed === undefined)
    throw new InvalidOperationError(Operation.Update, entry, "no claim is held, so there is nothing to miss");
  const message: ClaimMessage = { ...claimed.message, miss };
  const outcome = pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, createFleetCommit(message), claimed.sha);
  if (outcome !== FleetPushOutcome.Pushed)
    throw new InvalidOperationError(
      Operation.Update,
      entry,
      "the claim moved since it was read, so the miss did not land",
    );
};
