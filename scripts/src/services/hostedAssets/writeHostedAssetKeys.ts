import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetKeyPairs } from "#src/services/hostedAssets/getHostedAssetKeyPairs";
import { getHostedAssetKeysSource } from "#src/services/hostedAssets/getHostedAssetKeysSource";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { publishFile } from "#src/services/shared/publishFile";

// The name a record product's key renders under, which is its lock key
const toLockKeyName = (lockKey: string): string => lockKey;

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole. A record
// Product names each key by its lock key, so its keys are the lock's own
export const writeHostedAssetKeys = async (
  productName: string,
  lock: HostedAssetLock,
  keysPath: string,
): Promise<void> => {
  await publishFile(
    keysPath,
    await formatGeneratedSource(
      keysPath,
      getHostedAssetKeysSource(
        productName,
        getHostedAssetKeyPairs(Object.keys(lock.objects), toLockKeyName),
        getHostedAssetKeyPairs(Object.keys(lock.indexes), toLockKeyName),
      ),
    ),
  );
};
