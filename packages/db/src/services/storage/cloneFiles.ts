import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database, FileEntity, StorageBucket, UserInAuth } from "@esposter/db-schema";

import { chargeAndCopyBlob } from "#src/services/storage/chargeAndCopyBlob";
import { deleteBlobs } from "#src/services/storage/deleteBlobs";
import { getFileBlobNames } from "#src/services/storage/getFileBlobNames";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { getResultAsync, InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { v7 } from "uuid";

// Returns each clone's minted id alongside the thumbnail state its blobs actually carry, so the caller
// Writes an entity that describes what was copied rather than what the source claimed. Every copy is charged to
// `userId` before it is written, and a clone that fails gives back the charge of every copy it had made.
export const cloneFiles = async (
  db: Database,
  userId: UserInAuth["id"],
  bucketName: StorageBucket,
  bucket: R2Bucket,
  files: FileEntity[],
  sourcePrefix = "",
  destinationPrefix = sourcePrefix,
): Promise<Pick<FileEntity, "hasThumbnail" | "id">[]> => {
  if (files.length === 0) return [];

  const writtenBlobNames: string[] = [];
  const copyChargedBlob = async (sourceBlobName: string, destinationBlobName: string) => {
    // One HEAD answers what the copy costs its new owner, and fails if the source is not there to copy
    const sourceObject = await bucket.head(sourceBlobName);
    if (!sourceObject) throw new InvalidOperationError(Operation.Read, sourceBlobName, "is not in the bucket to copy");

    await chargeAndCopyBlob(db, userId, bucketName, bucket, sourceBlobName, destinationBlobName, sourceObject.size);
    writtenBlobNames.push(destinationBlobName);
  };
  // Awaited rather than returned: the error arm below resolves to `Promise<never>`, so the match's own type is
  // The union of that and the clone list until an await collapses it
  const clonedFiles = await getResultAsync(() =>
    settleAll(
      files.map(({ filename, hasThumbnail, id }) => async () => {
        const newId: string = v7();
        const sourceBlobNames = getFileBlobNames(sourcePrefix, id, filename);
        const destinationBlobNames = getFileBlobNames(destinationPrefix, newId, filename);
        await copyChargedBlob(sourceBlobNames.blobName, destinationBlobNames.blobName);
        // The thumbnail is a sibling blob, not part of the original, so copying only the original leaves a
        // Clone whose `hasThumbnail` points the renderer at a blob that was never written. `hasThumbnail` is
        // The uploader's own record that it wrote one (see FileEntity), so it is read here rather than probed
        if (hasThumbnail)
          await copyChargedBlob(sourceBlobNames.thumbnailBlobName, destinationBlobNames.thumbnailBlobName);
        return { hasThumbnail, id: newId };
      }),
    ),
  ).match(
    (successfulClones) => successfulClones,
    // A clone is all-or-nothing to its caller — a rejection here posts no message and rewrites no content — so
    // Whatever landed before the failure is referenced by nothing and reclaimed by nothing until the whole room
    // Or resource is torn down, and each retry mints a fresh id rather than overwriting it. Clearing is safe
    // Precisely because these names were minted moments ago: no other content can point at them yet, unlike
    // `restorePublishedVersion`, whose destination is a live working copy a directory-wide delete would destroy.
    // `settleAll` above is what makes the name list complete: a copy still in flight when the delete ran would
    // Land after it and strand the blob it wrote. The charges go with the blobs, so nothing stays counted for a
    // Blob that no longer exists
    async (error) => {
      await deleteBlobs(bucket, writtenBlobNames);
      await releaseStorageLedgerEntries(db, bucketName, writtenBlobNames);
      throw error;
    },
  );
  return clonedFiles;
};
