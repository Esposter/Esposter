import type { EventGridHandler } from "@azure/functions";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { deleteBlobs } from "@esposter/db";
import { AzureContainer, AzureFunction, getUserProfileImageBlobName, parseBlobSubject } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// A profile image's write SAS outlives the request that minted it, so its blob can land after the account has been
// Swept. Nothing lists it at that point, so the landing deletes itself. A landing for an account still in use is kept
export const deleteOrphanedProfileImageHandler: EventGridHandler = (event, context) =>
  getResultAsync(async () => {
    const parsedBlobSubject = parseBlobSubject(event.subject, [AzureContainer.PublicUserAssets]);
    if (!parsedBlobSubject) return;

    const { blobName } = parsedBlobSubject;
    // A room's image is named under its room, so only a profile image's first segment names an owner
    const [userId] = blobName.split("/");
    if (!userId || blobName !== getUserProfileImageBlobName(userId)) return;

    const user = await db.query.usersInAuth.findFirst({
      columns: { deletionRequestedAt: true },
      where: { id: { eq: userId } },
    });
    if (user && !user.deletionRequestedAt) return;

    const containerClient = await getContainerClient(AzureContainer.PublicUserAssets);
    await deleteBlobs(containerClient, [blobName]);
  }).match(noop, logAndRethrow(context, AzureFunction.DeleteOrphanedProfileImage));
