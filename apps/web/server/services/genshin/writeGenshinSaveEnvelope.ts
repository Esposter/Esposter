import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { ContainerClient } from "@azure/storage-blob";

import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { getGenshinSessionReplacedError } from "#server/services/genshin/getGenshinSessionReplacedError";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Writes the envelope under the ETag read, through the shared blob-state write. A blob that changed under the read means
// The lease was lost, to a save or a start from another session alike, so its CONFLICT is refused as a replacement
// Rather than retried
export const writeGenshinSaveEnvelope = (
  containerClient: ContainerClient,
  userId: string,
  envelope: GenshinSaveEnvelope,
  etag: string | undefined,
): Promise<string | undefined> =>
  getResultAsync(() => writeBlobState(containerClient, getSaveBlobName(userId), JSON.stringify(envelope), etag)).match(
    (writtenEtag) => writtenEtag,
    (error) => {
      if (error instanceof TRPCError && error.code === "CONFLICT") throw getGenshinSessionReplacedError();
      throw error;
    },
  );
