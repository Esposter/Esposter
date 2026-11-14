import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { createSnapshotObjectStore } from "#server/services/resource/snapshot/createSnapshotObjectStore";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { bucketMock } = vi.hoisted(() => ({ bucketMock: {} as { current: R2Bucket } }));

vi.mock(import("#server/services/storage/getBucket"), () => ({ getBucket: () => bucketMock.current }));

describe(createSnapshotObjectStore, () => {
  const resourceId: ResourceInResource["id"] = crypto.randomUUID();
  const hash = "hash";
  const bytes = new Uint8Array(1);
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
  });

  beforeEach(() => {
    bucketMock.current = bucket;
  });

  afterAll(async () => {
    await dispose();
  });

  // Write-once: the second write of an address finds the first one stored, and is told so rather than overwriting it
  test("reports a write to an address already stored as a deduplicated write rather than throwing", async () => {
    expect.hasAssertions();

    const objectStore = await createSnapshotObjectStore(resourceId);

    await expect(objectStore.write(hash, bytes)).resolves.toBe(true);
    await expect(objectStore.write(hash, bytes)).resolves.toBe(false);
  });

  test("rethrows an upload failure", async () => {
    expect.hasAssertions();

    const uploadError = new Error("upload failed");
    bucketMock.current = { put: () => Promise.reject(uploadError) } as unknown as R2Bucket;
    const objectStore = await createSnapshotObjectStore(resourceId);

    await expect(objectStore.write(hash, bytes)).rejects.toBe(uploadError);
  });
});
