import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { ContainerClient } from "@azure/storage-blob";

import { R2_CONNECT_ATTEMPTS } from "#src/services/cutover/constants";
import { checkIsSameObject } from "#src/services/cutover/objects/checkIsSameObject";
import { checkIsTextualBlob } from "#src/services/cutover/objects/checkIsTextualBlob";
import { copyBlobToBucket } from "#src/services/cutover/objects/copyBlobToBucket";
import { readExpectedObject } from "#src/services/cutover/objects/readExpectedObject";
import { getResultAsync, noop } from "@esposter/shared";

// A blob's copy is a fresh download and a PUT that overwrites, so a failed one is run again whole, a bounded number of
// Times: an upload's stream cannot be resent, and a dropped connection to Azure or R2 is the usual failure on a long copy
const copyBlobWithRetry = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
  key: string,
  idMap: IdMap,
  attempt = 1,
): Promise<void> => {
  await getResultAsync(() => copyBlobToBucket(client, containerClient, bucket, blob, key, idMap)).match(
    noop,
    (error) => {
      if (attempt >= R2_CONNECT_ATTEMPTS) throw error;
      return copyBlobWithRetry(client, containerClient, bucket, blob, key, idMap, attempt + 1);
    },
  );
};

// Copies a blob under its new key, unless its object is already stored with the same bytes. Resolves to whether it copied.
// A textual blob is compared with its bytes as the rewrite stores them, not with Azure's: an object an earlier rewrite
// Left identical to Azure's would otherwise read as current after the rewrite changed what it writes
export const copyBlobIfChanged = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
  idMap: IdMap,
): Promise<boolean> => {
  const key = idMap.rewrite(blob.name);
  const stored = await client.headObject(bucket, key);
  if (stored !== undefined && checkIsTextualBlob(blob)) {
    const expected = await readExpectedObject(containerClient, blob, (text) => idMap.rewrite(text));
    if (expected.size === stored.size && expected.md5 === stored.etag) return false;
  } else if (checkIsSameObject(blob, stored)) return false;
  await copyBlobWithRetry(client, containerClient, bucket, blob, key, idMap);
  return true;
};
