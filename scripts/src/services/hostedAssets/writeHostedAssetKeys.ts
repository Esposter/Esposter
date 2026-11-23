import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetLockKeysSource } from "#src/services/hostedAssets/getHostedAssetLockKeysSource";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole. A record
// Product names each key by its lock key, so its keys are the lock's own
export const writeHostedAssetKeys = async (
  productName: string,
  lock: HostedAssetLock,
  keysPath: string,
): Promise<void> => {
  await publishFile(keysPath, await formatGeneratedSource(keysPath, getHostedAssetLockKeysSource(productName, lock)));
};
