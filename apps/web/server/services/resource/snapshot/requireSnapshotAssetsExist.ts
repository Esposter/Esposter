import type { ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { touchResourceAssetBlob } from "#server/services/resource/touchResourceAssetBlob";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { AzureContainer, DatabaseEntityType, MAX_CONCURRENT_BLOB_COPIES } from "@esposter/db-schema";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";

// Every asset a version is about to name must still be stored, or the version is refused: a publish racing a file
// Delete fails here instead of storing a page whose images are gone. Each asset is touched rather than only checked,
// So its grace window restarts, and a collection that decides on it after this check keeps it until the version
// Naming it is stored. The caller holds the resource's object lock, so a collection cannot choose one of these assets
// For deletion between this check and the reference rows naming it
export const requireSnapshotAssetsExist = async (
  resourceId: ResourceInResource["id"],
  assetHashes: Set<string>,
): Promise<void> => {
  if (assetHashes.size === 0) return;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const touches = await settleAll(
    Array.from(
      assetHashes,
      (hash) => () => touchResourceAssetBlob(containerClient, getResourceFileBlobName(resourceId, hash)),
    ),
    MAX_CONCURRENT_BLOB_COPIES,
  );
  if (touches.includes(false))
    throw new InvalidOperationError(
      Operation.Create,
      DatabaseEntityType.Resource,
      "cannot store a version naming a missing asset",
    );
};
