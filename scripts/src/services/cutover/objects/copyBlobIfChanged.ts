import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { ContainerClient } from "@azure/storage-blob";

import { checkIsSameObject } from "#src/services/cutover/objects/checkIsSameObject";
import { copyBlobToBucket } from "#src/services/cutover/objects/copyBlobToBucket";

// Copies a blob under its new key, unless its object is already stored with the same bytes. Resolves to whether it copied.
// A textual blob whose ids were rewritten is stored with a different MD5 than Azure's, so it is copied again on a re-run, which writes the same bytes
export const copyBlobIfChanged = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
  idMap: IdMap,
): Promise<boolean> => {
  const key = idMap.rewrite(blob.name);
  const stored = await client.headObject(bucket, key);
  if (checkIsSameObject(blob, stored)) return false;
  await copyBlobToBucket(client, containerClient, bucket, blob, key, idMap);
  return true;
};
