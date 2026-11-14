import type { Context } from "#server/trpc/context";
import type { GenerateUploadFileSasEntitiesInput } from "#shared/models/db/message/GenerateUploadFileSasEntitiesInput";
import type { FileSasEntity, UserInAuth } from "@esposter/db-schema";

import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import { generateUploadFileSasEntities } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The write targets for one message's files, each original and image thumbnail reserved against the uploader's
// Allowance before any is signed, so a refused reserve hands out no target. The room is the blob prefix only: the
// Bytes belong to whoever uploaded them (openspec/specs/resource/storage-quotas/design.md)
export const generateReservedMessageFileSasEntities = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  roomId: string,
  files: GenerateUploadFileSasEntitiesInput["files"],
): Promise<FileSasEntity[]> =>
  generateUploadFileSasEntities(getStorageCredentials(), StorageBucket.MessageAssets, files, roomId, {
    reserve: (reservations) => reserveStorageBytes(db, userId, StorageBucket.MessageAssets, reservations),
    withThumbnail: true,
  });
