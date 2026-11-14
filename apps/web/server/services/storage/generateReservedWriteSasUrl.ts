import type { Context } from "#server/trpc/context";
import type { StorageBucket, UserInAuth } from "@esposter/db-schema";

import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import { MimeType } from "#shared/models/file/MimeType";
import { createPresignedPutUrl } from "@esposter/db";

// The upload chokepoint for a write target whose name the server fixes rather than mints per upload — a
// Resource's staging blob. Signed and reserved in one call, so a write target nothing accounts for cannot be handed
// Out. The staging blob is always the gzip the client PUTs, so the target is signed for that type
// See openspec/specs/resource/storage-quotas/design.md
export const generateReservedWriteSasUrl = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  containerName: StorageBucket,
  blobName: string,
  declaredBytes: number,
): Promise<string> => {
  const sasUrl = await createPresignedPutUrl(getStorageCredentials(), containerName, blobName, MimeType.Gzip);
  await reserveStorageBytes(db, userId, containerName, [{ blobName, declaredBytes }]);
  return sasUrl;
};
