import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetFileKey } from "hosted-assets";

// Every file key a lock names under a files product's scope, which is what a pull of every file restores
export const getHostedAssetFileKeys = (scope: string, lock: HostedAssetLock): string[] =>
  Object.keys(lock.objects).map((lockKey) => getHostedAssetFileKey(scope, lockKey));
