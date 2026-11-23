import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_OBJECT_BODIES } from "#src/services/hostedAssets/constants";
import { getHostedAssetFilesScope } from "#src/services/hostedAssets/getHostedAssetFilesScope";
import { getHostedAssetFilesSource } from "#src/services/hostedAssets/getHostedAssetFilesSource";
import { getHostedAssetLockKey } from "#src/services/hostedAssets/getHostedAssetLockKey";
import { verifyHostedAssetObject } from "#src/services/hostedAssets/verifyHostedAssetObject";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "hosted-assets";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, sep } from "node:path";

// Restores files of a files product's working copy from their objects: each named file is fetched anonymously from the
// Hosted Origin, checked against its name and the length its lock records, and written at its key under the folder, so
// A changed Original can be published again. The product is checked first, so a refusal fetches nothing. Resolves to
// How many files it wrote
export const pullHostedAssetFiles = async (
  baseUrl: string,
  product: HostedAssetProduct,
  lock: HostedAssetLock,
  keys: string[],
  repositoryRoot: string,
): Promise<number> => {
  const { folder } = getHostedAssetFilesSource(product);
  const directory = join(repositoryRoot, folder);
  const scope = getHostedAssetFilesScope(product);
  await settleAll(
    keys.map((key) => async () => {
      const object = lock.objects[getHostedAssetLockKey(scope, key)];
      if (object === undefined) throw new InvalidOperationError(Operation.Read, key, "is not a key of the lock");
      // A lock can name a key with a parent segment, which the folder walk never produces, so the path is checked
      // Before Any byte is read or written
      const path = join(directory, key);
      if (!path.startsWith(`${directory}${sep}`))
        throw new InvalidOperationError(Operation.Read, key, "leaves its product's folder");
      const bytes = await verifyHostedAssetObject(baseUrl, object, object.bytes, HOSTED_ASSETS_FETCH_TIMEOUT_MS);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, bytes);
    }),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
  return keys.length;
};
