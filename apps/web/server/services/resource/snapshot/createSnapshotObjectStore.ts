import type { Resource } from "@esposter/db-schema";
import type { ObjectStore } from "keyframe-store";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { getSnapshotObjectBlobName } from "@@/server/services/resource/snapshot/getSnapshotObjectBlobName";
import { RestError } from "@azure/storage-blob";
import { checkIsNotFound } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The store's only contact with storage: one resource's objects in the resource assets container, keyed by
// Content address. Write-once is the service's own condition rather than a check followed by a write, so two
// Writers of the same content cannot race — the second lands on the blob the first created, and is told so,
// Because the object under the key is the first writer's and may decode against another keyframe than the one
// It encoded. Deletion goes through the published event rather than a direct delete, because that path already
// Deletes and releases the ledger entry as one retried unit, and a bare delete would leave the object's bytes
// Charged to the owner forever
export const createSnapshotObjectStore = async (resourceId: Resource["id"]): Promise<ObjectStore> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  return {
    delete: (keys) =>
      publishBlobDeletion(
        resourceId,
        AzureContainer.ResourceAssets,
        keys.map((key) => getSnapshotObjectBlobName(resourceId, key)),
      ).match(noop, console.error),
    read: async (key, byteCount) => {
      const readableStreamBody = await getResultAsync(() =>
        containerClient.getBlockBlobClient(getSnapshotObjectBlobName(resourceId, key)).download(0, byteCount),
      ).match(
        (response) => response.readableStreamBody,
        (error) => {
          if (checkIsNotFound(error)) return undefined;
          throw error;
        },
      );
      if (!readableStreamBody) return undefined;

      return Buffer.concat((await Array.fromAsync(readableStreamBody)).map((chunk) => Buffer.from(chunk)));
    },
    write: (key, bytes) =>
      getResultAsync(() =>
        containerClient
          .getBlockBlobClient(getSnapshotObjectBlobName(resourceId, key))
          .upload(bytes, bytes.byteLength, { conditions: { ifNoneMatch: "*" } }),
      ).match(
        () => true,
        (error) => {
          // Already stored under its own address, by this write's twin
          if (error instanceof RestError && error.statusCode === 409) return false;
          throw error;
        },
      ),
  };
};
