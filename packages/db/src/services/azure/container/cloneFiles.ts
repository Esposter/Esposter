import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { copyBlob } from "@/services/azure/container/copyBlob";
import { getBlobName } from "@/services/azure/container/getBlobName";
import { getThumbnailBlobName } from "@/services/azure/container/getThumbnailBlobName";

// Returns each clone's minted id alongside the thumbnail state its blobs actually carry, so the caller
// Writes an entity that describes what was copied rather than what the source claimed.
export const cloneFiles = (
  containerClient: ContainerClient,
  files: FileEntity[],
  sourcePrefix = "",
  destinationPrefix = sourcePrefix,
): Promise<Pick<FileEntity, "hasThumbnail" | "id">[]> => {
  if (files.length === 0) return Promise.resolve([]);
  else
    return Promise.all(
      files.map(async ({ filename, hasThumbnail, id }) => {
        const newId: string = crypto.randomUUID();
        await copyBlob(
          containerClient,
          getBlobName(`${sourcePrefix}/${id}`, filename),
          getBlobName(`${destinationPrefix}/${newId}`, filename),
        );
        // The thumbnail is a sibling blob, not part of the original, so copying only the original leaves a
        // Clone whose `hasThumbnail` points the renderer at a blob that was never written. `hasThumbnail` is
        // The uploader's own record that it wrote one (see FileEntity), so it is read here rather than probed
        if (hasThumbnail)
          await copyBlob(
            containerClient,
            getThumbnailBlobName(sourcePrefix, id),
            getThumbnailBlobName(destinationPrefix, newId),
          );
        return { hasThumbnail, id: newId };
      }),
    );
};
