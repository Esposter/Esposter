import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetProducts } from "#src/services/hostedAssets/getHostedAssetProducts";
import { readPublishedHostedAssetLock } from "#src/services/hostedAssets/readPublishedHostedAssetLock";

// The lock of every other declared product, read from disk. A product not yet published reads as the empty lock, which
// Declares no scope to overlap
export const readOtherHostedAssetLocks = (product: HostedAssetProduct): Promise<HostedAssetLock[]> =>
  Promise.all(
    getHostedAssetProducts()
      .filter(({ lockPath }) => lockPath !== product.lockPath)
      .map(({ lockPath }) => readPublishedHostedAssetLock(lockPath)),
  );
