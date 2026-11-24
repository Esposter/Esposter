import type { HostedAssetLock } from "hosted-assets";

import { formatHostedAssetLock } from "#src/services/hostedAssets/formatHostedAssetLock";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the lock through a partial file of its own.
// So an interrupted write leaves the committed lock whole.
// Two writes in one checkout never share a partial file.
export const writeHostedAssetLock = async (lock: HostedAssetLock, lockPath: string): Promise<void> => {
  await publishFile(lockPath, formatHostedAssetLock(lock));
};
