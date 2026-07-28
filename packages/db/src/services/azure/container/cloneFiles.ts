import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { copyBlob } from "@/services/azure/container/copyBlob";
import { getBlobName } from "@/services/azure/container/getBlobName";
import { getThumbnailBlobName } from "@/services/azure/container/getThumbnailBlobName";
import { getResultAsync } from "@esposter/shared";

// Returns each clone's minted id alongside the thumbnail state its blobs actually carry, so the caller
// Writes an entity that describes what was copied rather than what the source claimed.
export const cloneFiles = async (
  containerClient: ContainerClient,
  files: FileEntity[],
  sourcePrefix = "",
  destinationPrefix = sourcePrefix,
): Promise<Pick<FileEntity, "hasThumbnail" | "id">[]> => {
  if (files.length === 0) return [];

  const writtenBlobNames: string[] = [];
  // Awaited rather than returned: the error arm below resolves to `Promise<never>`, so the match's own type is
  // The union of that and the clone list until an await collapses it
  const clonedFiles = await getResultAsync(() =>
    Promise.all(
      files.map(async ({ filename, hasThumbnail, id }) => {
        const newId: string = crypto.randomUUID();
        const destinationBlobName = getBlobName(`${destinationPrefix}/${newId}`, filename);
        await copyBlob(containerClient, getBlobName(`${sourcePrefix}/${id}`, filename), destinationBlobName);
        writtenBlobNames.push(destinationBlobName);
        // The thumbnail is a sibling blob, not part of the original, so copying only the original leaves a
        // Clone whose `hasThumbnail` points the renderer at a blob that was never written. `hasThumbnail` is
        // The uploader's own record that it wrote one (see FileEntity), so it is read here rather than probed
        if (hasThumbnail) {
          const destinationThumbnailBlobName = getThumbnailBlobName(destinationPrefix, newId);
          await copyBlob(containerClient, getThumbnailBlobName(sourcePrefix, id), destinationThumbnailBlobName);
          writtenBlobNames.push(destinationThumbnailBlobName);
        }
        return { hasThumbnail, id: newId };
      }),
    ),
  ).match(
    (successfulClones) => successfulClones,
    // A clone is all-or-nothing to its caller — a rejection here posts no message and rewrites no content — so
    // Whatever landed before the failure is referenced by nothing and reclaimed by nothing until the whole room
    // Or resource is torn down, and each retry mints a fresh id rather than overwriting it. Clearing is safe
    // Precisely because these names were minted moments ago: no other content can point at them yet, unlike
    // `restorePublishedVersion`, whose destination is a live working copy a directory-wide delete would destroy
    async (error) => {
      await Promise.all(
        writtenBlobNames.map((blobName) => containerClient.getBlockBlobClient(blobName).deleteIfExists()),
      );
      throw error;
    },
  );
  return clonedFiles;
};
