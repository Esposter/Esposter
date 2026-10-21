import type { Context } from "#server/trpc/context";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";
import type { ResourceInResource, UserInAuth } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { touchResourceAssetBlob } from "#server/services/resource/touchResourceAssetBlob";
import { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { generateWriteSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// The write targets for one batch of resource files, each addressed by the hash of its bytes. A file the resource
// Already holds under its hash gets no signature and no quota hold: its blob's last-modified time moves instead, so the
// Collection's grace window restarts from this upload, and the client skips the PUT. A held blob that is gone by the
// Time it is touched is no longer held, so it is reserved and signed like any other file. Any other file is reserved
// Against the owner's quota and given a write SAS for exactly its hash name. The reserve runs before the response, so a
// Rejection is a write target the client never receives.
export const generateReservedResourceAssetSasEntities = async (
  db: Context["db"],
  userId: UserInAuth["id"],
  resourceId: ResourceInResource["id"],
  files: { hash: string; mimetype: string; size: number }[],
): Promise<ResourceFileSasEntity[]> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const fileEntries = await Promise.all(
    files.map(async (file) => {
      const blobName = getResourceFileBlobName(resourceId, file.hash);
      const isHeld = await touchResourceAssetBlob(containerClient, blobName);
      return { ...file, blobName, isHeld };
    }),
  );

  await reserveStorageBytes(
    db,
    userId,
    AzureContainer.ResourceAssets,
    fileEntries.filter(({ isHeld }) => !isHeld).map(({ blobName, size }) => ({ blobName, declaredBytes: size })),
  );

  return Promise.all(
    fileEntries.map(async ({ blobName, hash, isHeld, mimetype }) => ({
      id: hash,
      isHeld,
      sasUrl: isHeld
        ? ""
        : await generateWriteSasUrl(containerClient.getBlockBlobClient(blobName), { contentType: mimetype }),
    })),
  );
};
