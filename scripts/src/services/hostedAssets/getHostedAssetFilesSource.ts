import type { HostedAssetFilesSource } from "#src/models/hostedAssets/HostedAssetFilesSource";
import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The source of a files product, which a publish reads and a pull restores. A records product has none, since its own
// Command publishes it
export const getHostedAssetFilesSource = (product: HostedAssetProduct): HostedAssetFilesSource => {
  const { source } = product;
  if (source.kind === "records")
    throw new InvalidOperationError(Operation.Update, product.name, "is published by its own command");
  return source;
};
