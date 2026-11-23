import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetKeyPairs } from "#src/services/hostedAssets/getHostedAssetKeyPairs";
import { getHostedAssetKeysSource } from "#src/services/hostedAssets/getHostedAssetKeysSource";

// The name a record product's key renders under, which is its lock key
const toLockKeyName = (lockKey: string): string => lockKey;

// The keys file source a record product's lock renders to, each key named by its lock key
export const getHostedAssetLockKeysSource = (productName: string, lock: HostedAssetLock): string =>
  getHostedAssetKeysSource(
    productName,
    getHostedAssetKeyPairs(Object.keys(lock.objects), toLockKeyName),
    getHostedAssetKeyPairs(Object.keys(lock.indexes), toLockKeyName),
  );
