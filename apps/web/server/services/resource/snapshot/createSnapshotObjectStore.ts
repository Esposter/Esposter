import type { ResourceInResource } from "@esposter/db-schema";
import type { ObjectStore } from "keyframe-store";

import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { getSnapshotObjectBlobName } from "#server/services/resource/snapshot/getSnapshotObjectBlobName";
import { getBucket } from "#server/services/storage/getBucket";
import { StorageBucket } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

// The store's only contact with storage: one resource's objects in the resource assets bucket, keyed by
// Content address. Write-once is the service's own condition rather than a check followed by a write, so two
// Writers of the same content cannot race — the second lands on the object the first created, and is told so,
// Because the object under the key is the first writer's and may decode against another keyframe than the one
// It encoded. Deletion goes through the published event rather than a direct delete, because that path already
// Deletes and releases the ledger entry as one retried unit, and a bare delete would leave the object's bytes
// Charged to the owner forever
export const createSnapshotObjectStore = async (resourceId: ResourceInResource["id"]): Promise<ObjectStore> => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  return {
    delete: (keys) =>
      publishBlobDeletion(
        StorageBucket.ResourceAssets,
        keys.map((key) => getSnapshotObjectBlobName(resourceId, key)),
      ).match(noop, console.error),
    read: async (key) => {
      const object = await bucket.get(getSnapshotObjectBlobName(resourceId, key));
      if (object) return Buffer.from(await object.arrayBuffer());
      else return undefined;
    },
    write: async (key, bytes) => {
      const stored = await bucket.put(getSnapshotObjectBlobName(resourceId, key), bytes, {
        onlyIf: { etagDoesNotMatch: "*" },
      });
      // Null when the object is already stored under its own address, by this write's twin
      return stored !== null;
    },
  };
};
