import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";
import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Writes the miss over a claim `holder` holds, keeping the claim so the stale takeover never takes it: the entry
// Waits for the coordinator's call. The miss is the holder's message on a new commit, leased from the commit it read
export const missFleetEntry = (entry: string, miss: string, holder: ClaimHolder): void => {
  const claimed = readClaimedRefs().get(entry);
  if (claimed === undefined)
    throw new InvalidOperationError(Operation.Update, entry, "no claim is held, so there is nothing to miss");
  if (!checkIsHeldBy(claimed.message, holder))
    throw new InvalidOperationError(
      Operation.Update,
      entry,
      `it is held by ${formatClaimHolder(claimed.message)}, not ${formatClaimHolder(holder)}`,
    );
  const message: ClaimMessage = { ...claimed.message, miss };
  const outcome = pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, createFleetCommit(message), claimed.sha);
  if (outcome !== FleetPushOutcome.Pushed)
    throw new InvalidOperationError(
      Operation.Update,
      entry,
      "the claim moved since it was read, so the miss did not land",
    );
  removeHoldFile(entry, holder.worker);
};
