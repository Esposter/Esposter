import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { commitHostedAssetLock } from "#src/services/hostedAssets/commitHostedAssetLock";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { formatHostedAssetFilesDryRun } from "#src/services/hostedAssets/formatHostedAssetFilesDryRun";
import { formatIdleHostedAssetPublish } from "#src/services/hostedAssets/formatIdleHostedAssetPublish";
import { getHostedAssetFilesScope } from "#src/services/hostedAssets/getHostedAssetFilesScope";
import { getHostedAssetFilesSource } from "#src/services/hostedAssets/getHostedAssetFilesSource";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { readHostedAssetSourceFolder } from "#src/services/hostedAssets/readHostedAssetSourceFolder";
import { readOtherHostedAssetLocks } from "#src/services/hostedAssets/readOtherHostedAssetLocks";
import { readPublishedHostedAssetLock } from "#src/services/hostedAssets/readPublishedHostedAssetLock";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CloudflareEnvironment } from "@esposter/db-schema";

// A files product's publish: its folder's files are planned, stored in both environments, and the lock committed once both
// Hold them. A dry run stores nothing and needs no credential, and names each lock entry and object it would change
export const publishHostedAssetFiles = async (product: HostedAssetProduct, isDryRun: boolean): Promise<string> => {
  const { folder, unhostedExtensions } = getHostedAssetFilesSource(product);
  // A files product declares one scope, under which every object of its folder is stored, so the scope is checked before
  // The folder is read
  const scope = getHostedAssetFilesScope(product);
  const files = await readHostedAssetSourceFolder(REPOSITORY_ROOT, folder, unhostedExtensions);
  const currentLock = await readPublishedHostedAssetLock(product.lockPath);
  const result = await publishHostedAssets({
    createBucketClientMap: isDryRun ? undefined : () => createHostedAssetBucketClientMap(product.bucket),
    currentLock,
    otherLocks: await readOtherHostedAssetLocks(product),
    plan: planHostedAssetFiles(scope, files),
    product,
    scopes: [scope],
  });
  if (result.outcome === HostedAssetPublishOutcome.Unchanged) return formatIdleHostedAssetPublish(product.name);
  if (result.outcome === HostedAssetPublishOutcome.DryRun)
    return formatHostedAssetFilesDryRun(product.name, currentLock, result.nextLock, result.records);
  await commitHostedAssetLock(product, [scope], result.plannedLock);
  const { uploadedCountMap } = result;
  return `${product.name}: ${result.storedObjectCount} objects published, ${uploadedCountMap[CloudflareEnvironment.Development]} uploaded to dev and ${uploadedCountMap[CloudflareEnvironment.Production]} to prod`;
};
