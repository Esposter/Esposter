import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { R2Bucket } from "@cloudflare/workers-types";

import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { listBlobNames } from "@esposter/db";

// Every blob under a prefix, each written under the entry directory with the name it has below that prefix. The same
// Prefix lists the blobs and is cut from each name, so the entry names cannot drift from the listing
export const writeBlobEntriesUnderPrefix = async (
  archive: UserDataArchive,
  bucket: R2Bucket,
  prefix: string,
  entryDirectory: string,
): Promise<void> => {
  const blobNames = await listBlobNames(bucket, prefix);
  for (const blobName of blobNames)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one blob at a time, streamed as it is read
    await writeBlobEntry(archive, `${entryDirectory}/${blobName.slice(prefix.length)}`, bucket, blobName);
};
