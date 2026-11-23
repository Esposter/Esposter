import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { mergeHostedAssetLock } from "#src/services/hostedAssets/mergeHostedAssetLock";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { writeHostedAssetLock } from "#src/services/hostedAssets/writeHostedAssetLock";

// Merges a publication's planned entries onto the lock as it stands now, not as it stood when the publication began: the
// Upload in between can take minutes, and a publication of another scope may have committed in that time. Resolves to the
// Lock it committed
export const commitHostedAssetLock = async (
  product: HostedAssetProduct,
  scopes: string[],
  plannedLock: HostedAssetLock,
): Promise<HostedAssetLock> => {
  const lock = mergeHostedAssetLock(product, await readHostedAssetLock(product.lockPath), scopes, plannedLock);
  await writeHostedAssetLock(lock, product.lockPath);
  return lock;
};
