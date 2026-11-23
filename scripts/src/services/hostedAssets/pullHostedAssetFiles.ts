import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_OBJECT_BODIES } from "#src/services/hostedAssets/constants";
import { getHostedAssetFilesFolder } from "#src/services/hostedAssets/getHostedAssetFilesFolder";
import { getHostedAssetLockKey } from "#src/services/hostedAssets/getHostedAssetLockKey";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { InvalidOperationError, Operation, settleAll, takeOne } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// Restores files of a files product's working copy from their objects: each named file is read back from the bucket, checked
// Against its name and the length its lock records, and written at its key under the folder, so a changed original can be
// Published again. The bucket is made only once the product is known to be a files product, so a refusal needs no credential.
// Resolves to how many files it wrote
export const pullHostedAssetFiles = async (
  createBucketClient: () => R2BucketClient,
  product: HostedAssetProduct,
  lock: HostedAssetLock,
  keys: string[],
  repositoryRoot: string,
): Promise<number> => {
  const folder = getHostedAssetFilesFolder(product);
  const bucketClient = createBucketClient();
  const scope = takeOne(product.scopes);
  await settleAll(
    keys.map((key) => async () => {
      const object = lock.objects[getHostedAssetLockKey(scope, key)];
      if (object === undefined) throw new InvalidOperationError(Operation.Read, key, "is not a key of the lock");
      const path = join(repositoryRoot, folder, key);
      const bytes = await readHostedAssetBytes(bucketClient, object);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, bytes);
    }),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
  return keys.length;
};
