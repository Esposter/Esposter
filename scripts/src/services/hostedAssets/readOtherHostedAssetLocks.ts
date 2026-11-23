import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetProducts } from "#src/services/hostedAssets/getHostedAssetProducts";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { existsSync } from "node:fs";

// The lock of every other declared product, read from disk. A product whose lock is not published yet has no scope on record
// To overlap, so it is skipped until its first publish writes the lock
export const readOtherHostedAssetLocks = (product: HostedAssetProduct): Promise<HostedAssetLock[]> =>
  Promise.all(
    getHostedAssetProducts()
      .filter(({ lockPath }) => lockPath !== product.lockPath && existsSync(lockPath))
      .map(({ lockPath }) => readHostedAssetLock(lockPath)),
  );
