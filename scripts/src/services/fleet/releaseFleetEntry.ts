import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { checkIsHeldBy } from "#src/services/fleet/checkIsHeldBy";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { runFleetRefGit } from "#src/services/fleet/runFleetRefGit";
import { REMOTE_NAME } from "#src/services/shared/constants";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";

// Deletes an entry's claim, so the entry is free for any worker, and stops the hold of `holder` at once. Only the worker
// That holds the claim releases it: another worker's claim, even on this machine, is refused. The delete is leased on the
// Claim it read, so a claim taken over in between is refused rather than deleted. A ref the remote no longer has is
// Released all the same
export const releaseFleetEntry = (entry: string, holder: ClaimHolder): void => {
  const claimed = readClaimedRefs().get(entry);
  if (claimed !== undefined && !checkIsHeldBy(claimed.message, holder))
    throw new InvalidOperationError(
      Operation.Delete,
      entry,
      `it is held by ${formatClaimHolder(claimed.message)}, not ${formatClaimHolder(holder)}`,
    );
  const ref = `${CLAIM_REF_PREFIX}${entry}`;
  // An empty lease expects the ref absent, so a claim read as absent is not deleted if another worker has created it since
  const lease = `--force-with-lease=${ref}:${claimed?.sha ?? ""}`;
  getResult(() => runFleetRefGit(["push", "--quiet", lease, REMOTE_NAME, `:${ref}`])).match(noop, (pushError) => {
    const remoteSha = readRemoteSha(ref);
    if (remoteSha === undefined) return;
    // Still at the leased claim, nothing refused the delete, so the push failed on its way and is thrown as it is
    if (remoteSha === claimed?.sha) throw pushError;
    // A renewal by this holder can land between the read and the delete, so the caller releases again on the claim it now reads
    throw new InvalidOperationError(
      Operation.Delete,
      entry,
      "its claim moved while it was released, so nothing was deleted: release it again",
    );
  });
  removeHoldFile(entry, holder.worker);
};
