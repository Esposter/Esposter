import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Object } from "#src/models/cutover/R2Object";
import type { VerifyBucketObjectsOptions } from "#src/models/cutover/VerifyBucketObjectsOptions";

import { listContainerBlobs } from "#src/services/cutover/azure/listContainerBlobs";
import { COPY_CONCURRENCY } from "#src/services/cutover/constants";
import { readExpectedObject } from "#src/services/cutover/objects/readExpectedObject";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks a bucket against its container: no key names an old id, the same number of objects, then each blob's object by its new key, its size and its MD5.
// The first difference fails the step, naming its key
export const verifyBucketObjects = async (options: VerifyBucketObjectsOptions): Promise<void> => {
  const { azure, bucket, client, idMap, r2Bucket } = options;
  const containerClient = azure.getContainerClient(bucket);
  const objects = new Map<string, R2Object>();
  for await (const object of client.listObjects(r2Bucket)) {
    if (idMap.rewrite(object.key) !== object.key)
      throw new InvalidOperationError(Operation.Read, r2Bucket, `holds the key ${object.key}, which names an old id`);
    objects.set(object.key, object);
  }
  const blobs: BlobEntry[] = [];
  for await (const blob of listContainerBlobs(containerClient)) blobs.push(blob);

  // The counts are compared before any key, so a bucket with missing objects is reported as such
  if (blobs.length !== objects.size)
    throw new InvalidOperationError(
      Operation.Read,
      bucket,
      `holds ${blobs.length} blobs but ${objects.size} objects in R2`,
    );
  await forEachConcurrently(blobs, COPY_CONCURRENCY, async (blob) => {
    const key = idMap.rewrite(blob.name);
    const object = objects.get(key);
    if (object === undefined) throw new InvalidOperationError(Operation.Read, key, "is missing from R2");
    const { md5, size } = await readExpectedObject(containerClient, blob, (text) => idMap.rewrite(text));
    if (object.size !== size)
      throw new InvalidOperationError(Operation.Read, key, `is ${size} bytes as copied but ${object.size} in R2`);
    if (md5 !== object.etag)
      throw new InvalidOperationError(Operation.Read, key, `has MD5 ${md5} in Azure but ${object.etag} in R2`);
  });
};
