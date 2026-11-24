import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetName } from "hosted-assets";

import { assertHostedAssetBytes } from "#src/services/hostedAssets/assertHostedAssetBytes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Reads one object back from its bucket, as the bucket serves its bytes.
// It refuses them unless they hash to the sha256 its key names, and to the length the lock records.
// A publish checks each object this way before its lock is committed.
// A pull checks it before a file is written, and a repair checks its source and its copy the same way.
export const readHostedAssetBytes = async (
  bucketClient: R2BucketClient,
  object: { bytes?: number | undefined } & HostedAssetName,
): Promise<Buffer> => {
  const key = getHostedAssetPath(object);
  const bytes = await bucketClient.get(key);
  if (bytes === undefined)
    throw new InvalidOperationError(Operation.Read, key, "is named by a lock but missing from its bucket");
  assertHostedAssetBytes(key, object, bytes, object.bytes);
  return bytes;
};
