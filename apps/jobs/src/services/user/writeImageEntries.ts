import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { listBlobNames } from "@esposter/db";
import { getUserProfileImageBlobName, StorageBucket } from "@esposter/db-schema";

// The person's profile image, when they have one, and each call background they have set.
// A profile image is optional, so its absence is no entry rather than a failed export
export const writeImageEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const publicBucket = getBucket(StorageBucket.PublicUserAssets);
  const profileImageBlobName = getUserProfileImageBlobName(userId);
  if (await publicBucket.head(profileImageBlobName))
    await writeBlobEntry(archive, "images/ProfileImage", publicBucket, profileImageBlobName);

  const userBucket = getBucket(StorageBucket.UserAssets);
  const callBackgroundPrefix = `${userId}/CallBackground/`;
  const callBackgroundBlobNames = await listBlobNames(userBucket, callBackgroundPrefix);
  for (const blobName of callBackgroundBlobNames)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one background at a time, streamed as it is read
    await writeBlobEntry(
      archive,
      `images/CallBackground/${blobName.slice(callBackgroundPrefix.length)}`,
      userBucket,
      blobName,
    );
};
