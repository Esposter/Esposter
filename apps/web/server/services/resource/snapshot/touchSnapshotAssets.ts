import type { ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { touchResourceAssetBlob } from "#server/services/resource/touchResourceAssetBlob";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { AzureContainer, MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { settleAll } from "@esposter/shared";

// Every asset a write is about to name that is still stored is touched rather than only checked, so its grace window
// Restarts, and a collection that decides on it after this point keeps it until the rows naming it are committed. The
// Assets that are not stored are handed back rather than refused here: whether a write may name one is the caller's
// Rule. The caller holds the resource's object lock, so a collection cannot choose one of these assets for deletion
// Between this touch and the rows naming it
export const touchSnapshotAssets = async (
  resourceId: ResourceInResource["id"],
  assetHashes: Set<string>,
): Promise<Set<string>> => {
  if (assetHashes.size === 0) return new Set();

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const touches = await settleAll(
    Array.from(assetHashes, (hash) => async () => ({
      hash,
      isStored: await touchResourceAssetBlob(containerClient, getResourceFileBlobName(resourceId, hash)),
    })),
    MAX_CONCURRENT_BLOB_COPIES,
  );
  return new Set(touches.filter(({ isStored }) => !isStored).map(({ hash }) => hash));
};
