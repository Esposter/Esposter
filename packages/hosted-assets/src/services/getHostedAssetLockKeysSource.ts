import type { HostedAssetLock } from "#src/models/HostedAssetLock";

import { getHostedAssetKeyPairs } from "#src/services/getHostedAssetKeyPairs";
import { getHostedAssetKeysSource } from "#src/services/getHostedAssetKeysSource";

// The keys file source a product's lock renders to, each key named by `toName` from its lock key. A record product
// Names each key by its lock key, which is the default
export const getHostedAssetLockKeysSource = (
  productName: string,
  lockFileName: string,
  lock: HostedAssetLock,
  toName: (lockKey: string) => string = (lockKey) => lockKey,
): string =>
  getHostedAssetKeysSource(
    productName,
    lockFileName,
    getHostedAssetKeyPairs(Object.keys(lock.objects), toName),
    getHostedAssetKeyPairs(Object.keys(lock.indexes), toName),
  );
