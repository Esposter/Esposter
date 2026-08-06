import type { StorageBlobReservation } from "@@/server/models/storage/StorageBlobReservation";
import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

import { getFileBlobNames } from "@esposter/db";
import { takeOne } from "@esposter/shared";

// The write targets a SAS batch just minted, expressed as the holds the counter must take for them. Named
// Through getFileBlobNames, the same place the SAS urls were signed against, so a blob the upload can reach
// And a blob the ledger accounts for are the same set by construction.
export const getStorageBlobReservations = (
  files: Pick<FileEntity, "filename" | "size">[],
  fileSasEntities: FileSasEntity[],
  prefix: string,
): StorageBlobReservation[] =>
  fileSasEntities.flatMap(({ id, thumbnailSasUrl }, index) => {
    const { filename, size } = takeOne(files, index);
    const { blobName, thumbnailBlobName } = getFileBlobNames(prefix, id, filename);
    // The client downscales the thumbnail itself, so its size is declared nowhere and cannot be reserved.
    // Holding zero for it still puts it in the ledger, which is what lets the settle sweep add the real
    // Size once the blob exists and the blob deletion give it back — the alternative is bytes stored
    // Under a user's name that nothing ever counts.
    return thumbnailSasUrl
      ? [
          { blobName, declaredBytes: size },
          { blobName: thumbnailBlobName, declaredBytes: 0 },
        ]
      : [{ blobName, declaredBytes: size }];
  });
