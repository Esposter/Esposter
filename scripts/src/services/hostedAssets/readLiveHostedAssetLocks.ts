import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { checkHasLockAt } from "#src/services/hostedAssets/checkHasLockAt";
import { HOSTED_ASSET_RETENTION_MS } from "#src/services/hostedAssets/constants";
import { getCommitsOf } from "#src/services/hostedAssets/getCommitsOf";
import { readLockAt } from "#src/services/hostedAssets/readLockAt";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// Every lock a stored object may still be reached by: the working tree's, HEAD's, each remote branch's head, every version
// Origin/main committed within the retention window, and the one in force when the window opened. The git history is the one
// Place a revert's lock is still written, so a revert within the window still resolves
export const readLiveHostedAssetLocks = (
  product: HostedAssetProduct,
  workingTreeLock: HostedAssetLock,
): HostedAssetLock[] => {
  const cutoff = new Date(Date.now() - HOSTED_ASSET_RETENTION_MS).toISOString();
  const revisions = [
    ...(checkHasLockAt(product, "HEAD") ? ["HEAD"] : []),
    ...getNonEmptyLines(runGit(["for-each-ref", "--format=%(objectname)", "refs/remotes/origin"])),
    ...getCommitsOf(product, ["origin/main", `--since=${cutoff}`]),
    ...getCommitsOf(product, ["-1", "origin/main", `--before=${cutoff}`]),
  ];
  const remoteLocks = [...new Set(revisions)]
    .filter((revision) => checkHasLockAt(product, revision))
    .map((revision) => readLockAt(product, revision));
  return [workingTreeLock, ...remoteLocks];
};
