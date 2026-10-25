import type { Context } from "#server/trpc/context";
import type { GenerateUploadFileSasEntitiesInput } from "#shared/models/db/message/GenerateUploadFileSasEntitiesInput";
import type { FileSasEntity, UserInAuth } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import { generateUploadFileSasEntities } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// The write targets for one message's files, each original and image thumbnail reserved against the uploader's
// allowance before any is signed, so a refused reserve hands out no target. The room is the blob prefix only: the
// bytes belong to whoever uploaded them (openspec/specs/resource/storage-quotas/design.md)
export const generateReservedMessageFileSasEntities = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  roomId: string,
  files: GenerateUploadFileSasEntitiesInput["files"],
): Promise<FileSasEntity[]> =>
  generateUploadFileSasEntities(await useContainerClient(AzureContainer.MessageAssets), files, roomId, {
    reserve: (reservations) => reserveStorageBytes(db, userId, AzureContainer.MessageAssets, reservations),
    withThumbnail: true,
  });
