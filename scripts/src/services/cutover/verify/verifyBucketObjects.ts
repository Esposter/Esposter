import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Object } from "#src/models/cutover/R2Object";
import type { VerifyBucketObjectsOptions } from "#src/models/cutover/VerifyBucketObjectsOptions";

import { listContainerBlobs } from "#src/services/cutover/azure/listContainerBlobs";
import { readBlobMd5 } from "#src/services/cutover/azure/readBlobMd5";
import { COPY_CONCURRENCY } from "#src/services/cutover/constants";
import { base64ToHex } from "#src/services/cutover/objects/base64ToHex";
import { runWithConcurrency } from "#src/services/cutover/objects/runWithConcurrency";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks a bucket against its container: the same number of objects and bytes, then each blob's object by key, its size and
// its MD5. A blob Azure stored no MD5 for is hashed from its bytes here. The first difference fails the step, naming its key
export const verifyBucketObjects = async (options: VerifyBucketObjectsOptions): Promise<void> => {
  const { azure, bucket, client, r2Bucket } = options;
  const containerClient = azure.getContainerClient(bucket);
  const objects = new Map<string, R2Object>();
  for await (const object of client.listObjects(r2Bucket)) objects.set(object.key, object);
  const blobs: BlobEntry[] = [];
  for await (const blob of listContainerBlobs(containerClient)) blobs.push(blob);

  // The counts are compared before any key, so a bucket with missing objects is reported as such
  if (blobs.length !== objects.size)
    throw new InvalidOperationError(Operation.Read, bucket, `holds ${blobs.length} blobs but ${objects.size} objects in R2`);
  const blobBytes = blobs.reduce((total, blob) => total + blob.size, 0);
  const objectBytes = [...objects.values()].reduce((total, object) => total + object.size, 0);
  if (blobBytes !== objectBytes)
    throw new InvalidOperationError(Operation.Read, bucket, `holds ${blobBytes} bytes but ${objectBytes} in R2`);

  await runWithConcurrency(blobs, COPY_CONCURRENCY, async (blob) => {
    const object = objects.get(blob.name);
    if (object === undefined) throw new InvalidOperationError(Operation.Read, blob.name, "is missing from R2");
    if (object.size !== blob.size)
      throw new InvalidOperationError(
        Operation.Read,
        blob.name,
        `is ${blob.size} bytes in Azure but ${object.size} in R2`,
      );
    const md5 = blob.md5 === undefined ? await readBlobMd5(containerClient, blob.name) : base64ToHex(blob.md5);
    if (md5 !== object.etag)
      throw new InvalidOperationError(Operation.Read, blob.name, `has MD5 ${md5} in Azure but ${object.etag} in R2`);
  });
};
