import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { getHostedAssetProducts } from "#src/services/hostedAssets/getHostedAssetProducts";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The declared product a command names, refused by name when no product declares it
export const readHostedAssetProduct = (name: string): HostedAssetProduct => {
  const product = getHostedAssetProducts().find((candidate) => candidate.name === name);
  if (product === undefined)
    throw new InvalidOperationError(Operation.Read, name, "is not a declared hosted asset product");
  return product;
};
