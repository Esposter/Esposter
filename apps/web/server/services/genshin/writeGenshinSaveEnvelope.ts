import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";

import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { getGenshinSessionReplacedError } from "#server/services/genshin/getGenshinSessionReplacedError";
import { checkIsPreconditionFailed, writeJsonBlob } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// Writes the envelope under the ETag read. A blob that changed under the read means the lease was lost, to a save or a
// Start from another session alike, so a failed precondition is refused as a replacement rather than retried
export const writeGenshinSaveEnvelope = (
  containerClient: ContainerClient,
  userId: string,
  envelope: GenshinSaveEnvelope,
  conditions: BlobRequestConditions,
) =>
  getResultAsync(() =>
    writeJsonBlob(containerClient, getSaveBlobName(userId), JSON.stringify(envelope), conditions),
  ).match(
    (result) => result,
    (error) => {
      if (checkIsPreconditionFailed(error)) throw getGenshinSessionReplacedError();
      throw error;
    },
  );
