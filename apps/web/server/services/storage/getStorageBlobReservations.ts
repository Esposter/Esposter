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
  fileSasEntities.map(({ id }, index) => {
    const { filename, size } = takeOne(files, index);
    return { blobName: getFileBlobNames(prefix, id, filename).blobName, declaredBytes: size };
  });
