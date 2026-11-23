import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetCopy } from "#src/models/hostedAssets/HostedAssetCopy";
import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { encodeStoredHostedAsset } from "#src/services/hostedAssets/encodeStoredHostedAsset";
import { putHostedAsset } from "#src/services/hostedAssets/putHostedAsset";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";

// Copies one object or index from the bucket that holds it into the one that lacks it. The source is read and checked
// Against Its name and its lock length, stored in the destination the way the publish stores it, and read back from the
// Destination
export const copyHostedAsset = async (
  product: HostedAssetProduct,
  { bytes, destination, name, source }: HostedAssetCopy,
  bucketClientMap: Record<CloudflareEnvironment, R2BucketClient>,
): Promise<void> => {
  const object = { ...name, bytes };
  const verifiedBytes = await readHostedAssetBytes(bucketClientMap[source], object);
  const destinationClient = bucketClientMap[destination];
  await putHostedAsset(
    destinationClient,
    name,
    await encodeStoredHostedAsset(product, { bytes: verifiedBytes, extension: name.extension }),
    true,
  );
  await readHostedAssetBytes(destinationClient, object);
};
