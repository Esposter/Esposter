import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_OBJECT_BODIES } from "#src/services/hostedAssets/constants";
import { copyHostedAsset } from "#src/services/hostedAssets/copyHostedAsset";
import { planHostedAssetRepair } from "#src/services/hostedAssets/planHostedAssetRepair";
import { settleAll } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Copies each object and index the lock names that one environment's bucket lacks from the other environment's bucket,
// And Resolves to the report the command prints. A dry run names each copy and writes nothing. A name neither bucket
// Holds fails The repair before any copy is made
export const repairHostedAssets = async (
  product: HostedAssetProduct,
  lock: HostedAssetLock,
  bucketClientMap: Record<CloudflareEnvironment, R2BucketClient>,
  isDryRun: boolean,
): Promise<string> => {
  const copies = await planHostedAssetRepair(lock, bucketClientMap);
  if (copies.length === 0) return `${product.name}: nothing to copy`;
  if (isDryRun)
    return [
      `${product.name}: dry run, nothing written`,
      ...copies.map(({ destination, name, source }) => `  ${getHostedAssetPath(name)}: ${source} to ${destination}`),
    ].join("\n");
  await settleAll(
    copies.map((copy) => () => copyHostedAsset(product, copy, bucketClientMap)),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
  return `${product.name}: copied ${copies.length}`;
};
