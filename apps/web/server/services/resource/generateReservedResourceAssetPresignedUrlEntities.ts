import type { Context } from "#server/trpc/context";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourceInResource, UserInAuth } from "@esposter/db-schema";

import { checkIsResourceAssetHeld } from "#server/services/resource/checkIsResourceAssetHeld";
import { getBucket } from "#server/services/storage/getBucket";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import { createPresignedPutUrl } from "@esposter/db";
import { getResourceFileBlobName, StorageBucket } from "@esposter/db-schema";

// The write targets for one batch of resource files, each addressed by the hash of its bytes. A file the resource
// Already holds under its hash, with bytes that hash to it, gets no signature and no quota hold: its blob's last-modified
// Time moves instead, so the Collection's grace window restarts from this upload, its type becomes the one this upload
// Declared, and the client skips the PUT. A held
// Blob that is gone by the time it is touched is no longer held, and bytes that do not hash to the name are removed rather
// Than held, so the file is reserved and signed like any other. Any other file is reserved
// Against the owner's quota and given a presigned write url for exactly its hash name. The reserve runs before the response, so a
// Rejection is a write target the client never receives.
export const generateReservedResourceAssetPresignedUrlEntities = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  resourceId: ResourceInResource["id"],
  files: { hash: string; mimetype: string; size: number }[],
): Promise<ResourceFilePresignedUrlEntity[]> => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  const fileEntries = await Promise.all(
    files.map(async (file) => {
      const blobName = getResourceFileBlobName(resourceId, file.hash);
      const isHeld = await checkIsResourceAssetHeld(bucket, blobName, file.hash, file.mimetype);
      return { ...file, blobName, isHeld };
    }),
  );

  await reserveStorageBytes(
    db,
    userId,
    StorageBucket.ResourceAssets,
    fileEntries.filter(({ isHeld }) => !isHeld).map(({ blobName, size }) => ({ blobName, declaredBytes: size })),
  );

  return Promise.all(
    fileEntries.map(async ({ blobName, hash, isHeld, mimetype }) => ({
      id: hash,
      isHeld,
      presignedUrl: isHeld
        ? ""
        : await createPresignedPutUrl(getStorageCredentials(), StorageBucket.ResourceAssets, blobName, mimetype),
    })),
  );
};
