import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The one scope a files product stores every object under. A product declaring more would plan its objects under the
// First Alone while the merge replaces every scope's entries, so it is refused rather than taken from the front
export const getHostedAssetFilesScope = (product: HostedAssetProduct): string => {
  if (product.scopes.length !== 1)
    throw new InvalidOperationError(Operation.Update, product.name, "must declare exactly one scope");
  return takeOne(product.scopes);
};
