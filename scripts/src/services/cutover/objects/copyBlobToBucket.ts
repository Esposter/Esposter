import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { ContainerClient } from "@azure/storage-blob";

import { downloadBlobBody } from "#src/services/cutover/azure/downloadBlobBody";
import { MD5_ALGORITHM } from "#src/services/cutover/constants";
import { hashBlobChunks } from "#src/services/cutover/objects/hashBlobChunks";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";

// Streams one blob into its R2 object, hashing the bytes as they pass. R2 answers the PUT with the MD5 it stored, which must
// be the one the bytes hashed to: an object that stored other bytes fails the step
export const copyBlobToBucket = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
): Promise<void> => {
  const body = await downloadBlobBody(containerClient, blob.name);
  const hash = createHash(MD5_ALGORITHM);
  const storedEtag = await client.putStream(bucket, blob.name, ReadableStream.from(hashBlobChunks(body, hash)), {
    cacheControl: blob.cacheControl,
    contentDisposition: blob.contentDisposition,
    contentType: blob.contentType,
    size: blob.size,
  });
  const md5 = hash.digest("hex");
  if (storedEtag !== md5)
    throw new InvalidOperationError(
      Operation.Create,
      blob.name,
      `was stored with ETag ${storedEtag}, not the MD5 ${md5} of its bytes`,
    );
};
