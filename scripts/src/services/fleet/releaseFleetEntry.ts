import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { CLAIM_REF_PREFIX, FLEET_REMOTE } from "#src/services/fleet/constants";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";

// Deletes an entry's claim, so the entry is free for any worker, and stops the hold of `holder` at once. Only the worker
// That holds the claim releases it: another worker's claim, even on this machine, is refused. A ref the remote no longer
// Has is released all the same
export const releaseFleetEntry = (entry: string, holder: ClaimHolder): void => {
  const claimed = readClaimedRefs().get(entry);
  if (claimed !== undefined && !checkIsHeldBy(claimed.message, holder))
    throw new InvalidOperationError(
      Operation.Delete,
      entry,
      `it is held by ${formatClaimHolder(claimed.message)}, not ${formatClaimHolder(holder)}`,
    );
  const ref = `${CLAIM_REF_PREFIX}${entry}`;
  getResult(() => runGit(["push", "--quiet", FLEET_REMOTE, `:${ref}`])).match(noop, (pushError) => {
    if (readRemoteSha(ref) !== undefined) throw pushError;
  });
  removeHoldFile(entry, holder.worker);
};
