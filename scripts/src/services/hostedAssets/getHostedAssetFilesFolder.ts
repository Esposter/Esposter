import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The repository folder a files product is published from and pulled to. A records product has none, since its own command
// Publishes it
export const getHostedAssetFilesFolder = (product: HostedAssetProduct): string => {
  const { source } = product;
  if (source.kind === "records")
    throw new InvalidOperationError(Operation.Update, product.name, "is published by its own command");
  return source.folder;
};
