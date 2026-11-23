import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { keepUnscopedHostedAssetEntries } from "#src/services/hostedAssets/keepUnscopedHostedAssetEntries";

// The lock a publish commits: every entry a scope names is dropped and the planned entries take their place. A whole
// Scope names every key under it, and a key scope names that one key alone, so a fit republishing one key leaves its
// Scope's other keys as they stand. An entry whose scope the product no longer declares goes too, so a retired scope
// Leaves the lock on its next write
export const mergeHostedAssetLock = (
  product: HostedAssetProduct,
  currentLock: HostedAssetLock,
  scopes: string[],
  plannedLock: HostedAssetLock,
): HostedAssetLock => ({
  indexes: { ...keepUnscopedHostedAssetEntries(currentLock.indexes, product.scopes, scopes), ...plannedLock.indexes },
  objects: { ...keepUnscopedHostedAssetEntries(currentLock.objects, product.scopes, scopes), ...plannedLock.objects },
});
