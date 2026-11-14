import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { ContainerClient } from "@azure/storage-blob";

import { checkIsSameObject } from "#src/services/cutover/objects/checkIsSameObject";
import { copyBlobToBucket } from "#src/services/cutover/objects/copyBlobToBucket";

// Copies a blob unless its object is already stored with the same bytes. Resolves to whether it copied
export const copyBlobIfChanged = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
): Promise<boolean> => {
  const stored = await client.headObject(bucket, blob.name);
  if (checkIsSameObject(blob, stored)) return false;
  await copyBlobToBucket(client, containerClient, bucket, blob);
  return true;
};
