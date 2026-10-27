import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { listBlobNames } from "@esposter/db";
import { AzureContainer, getUserProfileImageBlobName } from "@esposter/db-schema";

// The person's profile image, when they have one, and each call background they have set. A profile image is optional,
// So its absence is no entry rather than a failed export
export const writeImageEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const publicContainerClient = await getContainerClient(AzureContainer.PublicUserAssets);
  const profileImageBlobName = getUserProfileImageBlobName(userId);
  if (await publicContainerClient.getBlobClient(profileImageBlobName).exists())
    await writeBlobEntry(archive, "images/ProfileImage", publicContainerClient, profileImageBlobName);

  const privateContainerClient = await getContainerClient(AzureContainer.PrivateUserAssets);
  const callBackgroundPrefix = `${userId}/CallBackground/`;
  const callBackgroundBlobNames = await listBlobNames(privateContainerClient, callBackgroundPrefix);
  for (const blobName of callBackgroundBlobNames)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one background at a time, streamed as it is read
    await writeBlobEntry(
      archive,
      `images/CallBackground/${blobName.slice(callBackgroundPrefix.length)}`,
      privateContainerClient,
      blobName,
    );
};
