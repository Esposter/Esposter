import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { R2Bucket } from "@cloudflare/workers-types";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A blob's bytes stream into its entry as they are read, so an attachment is never held whole.
// A missing blob fails the read.
// That fails the export rather than leaving its entry out of an archive that reads as complete.
export const writeBlobEntry = async (
  archive: UserDataArchive,
  entryName: string,
  bucket: R2Bucket,
  blobName: string,
): Promise<void> => {
  const object = await bucket.get(blobName);
  if (!object)
    throw new InvalidOperationError(Operation.Read, blobName, "is not in the bucket to stream into the archive");
  await archive.addEntry(entryName, object.body);
};
