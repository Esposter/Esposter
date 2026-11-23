import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetObject } from "hosted-assets";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { assertContentAddress, getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetPath } from "hosted-assets";

// Reads one object back from its bucket, as the bucket serves its bytes, and refuses them unless they hash to the sha256 its
// Key names. A publish checks each object this way before its lock is committed, and a pull checks it before a file is written
export const readHostedAssetBytes = async (
  bucketClient: R2BucketClient,
  object: HostedAssetObject,
): Promise<Buffer> => {
  const key = getHostedAssetPath(object);
  const bytes = await bucketClient.get(key);
  if (bytes === undefined)
    throw new InvalidOperationError(Operation.Read, key, "is named by a lock but missing from its bucket");
  assertContentAddress(key, object.sha256, getContentAddress(bytes));
  return bytes;
};
