import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetObject } from "hosted-assets";

import { assertHostedAssetBytes } from "#src/services/hostedAssets/assertHostedAssetBytes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Reads one object back from its bucket, as the bucket serves its bytes, and refuses them unless they hash to the sha256 its
// Key names and are the length its lock records. A publish checks each object this way before its lock is committed, and a
// Pull checks it before a file is written
export const readHostedAssetBytes = async (
  bucketClient: R2BucketClient,
  object: HostedAssetObject,
): Promise<Buffer> => {
  const key = getHostedAssetPath(object);
  const bytes = await bucketClient.get(key);
  if (bytes === undefined)
    throw new InvalidOperationError(Operation.Read, key, "is named by a lock but missing from its bucket");
  assertHostedAssetBytes(key, object, bytes, object.bytes);
  return bytes;
};
