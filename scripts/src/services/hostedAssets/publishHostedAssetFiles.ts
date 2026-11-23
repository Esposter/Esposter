import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { commitHostedAssetLock } from "#src/services/hostedAssets/commitHostedAssetLock";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { getHostedAssetFilesFolder } from "#src/services/hostedAssets/getHostedAssetFilesFolder";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { readHostedAssetSourceFolder } from "#src/services/hostedAssets/readHostedAssetSourceFolder";
import { readOtherHostedAssetLocks } from "#src/services/hostedAssets/readOtherHostedAssetLocks";
import { readPublishedHostedAssetLock } from "#src/services/hostedAssets/readPublishedHostedAssetLock";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// A files product's publish: its folder's files are planned, stored in both environments, and the lock committed once both
// Hold them. A dry run stores nothing and needs no credential, and names each object it would store
export const publishHostedAssetFiles = async (product: HostedAssetProduct, isDryRun: boolean): Promise<string> => {
  const files = await readHostedAssetSourceFolder(REPOSITORY_ROOT, getHostedAssetFilesFolder(product));
  // A files product declares one scope, under which every object of its folder is stored
  const scope = takeOne(product.scopes);
  const result = await publishHostedAssets({
    createBucketClientMap: isDryRun ? undefined : () => createHostedAssetBucketClientMap(product.bucket),
    currentLock: await readPublishedHostedAssetLock(product.lockPath),
    otherLocks: await readOtherHostedAssetLocks(product),
    plan: planHostedAssetFiles(scope, files),
    product,
    scopes: [...product.scopes],
  });
  if (result.outcome === HostedAssetPublishOutcome.Unchanged) return `${product.name}: unchanged, no request made`;
  if (result.outcome === HostedAssetPublishOutcome.Empty) return `${product.name}: nothing published, no request made`;
  if (result.outcome === HostedAssetPublishOutcome.DryRun)
    return [
      `${product.name}: dry run, ${result.storedObjectCount} objects would be published`,
      ...result.records.map((record) => `  ${getHostedAssetPath(record)}: ${record.bytes.byteLength} bytes`),
    ].join("\n");
  await commitHostedAssetLock(product, [...product.scopes], result.plannedLock);
  const { uploadedCountMap } = result;
  return `${product.name}: ${result.storedObjectCount} objects published, ${uploadedCountMap[CloudflareEnvironment.Development]} uploaded to dev and ${uploadedCountMap[CloudflareEnvironment.Production]} to prod`;
};
