import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { writeSnapshotVersion } from "#server/services/resource/snapshot/writeSnapshotVersion";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { deleteDirectory, listBlobNames } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  StorageBucket,
  getResourceFileBlobName,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  SnapshotChannel,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";

describe(writeSnapshotVersion, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: ResourceInResource;
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const missingAssetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    resource = takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name: "name", type: ResourceType.Webpage, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await deleteDirectory(bucket);
    MockJobQueueDatabase.clear();
    await mockContext.db.delete(resourcesInResource);
    await mockContext.db.delete(storageLedgerInStorage);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  afterAll(async () => {
    await dispose();
  });

  // A publish that read content embedding an image, then lost the image to a file delete, must fail here. The version
  // Row and the reference rows are rolled back with the transaction, and the object is never written
  test("a stored version never names a missing asset", async () => {
    expect.hasAssertions();

    const missingAssetUrl = getResourceAssetUrl(getResourceFileBlobName(resource.id, missingAssetHash));
    const serializedContent = JSON.stringify({ sections: [{ image: missingAssetUrl, type: "image" }] });

    await expect(
      writeSnapshotVersion(
        mockContext.db,
        resource,
        { channel: SnapshotChannel.Published, version: 1 },
        serializedContent,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: Resource, cannot store content naming a missing asset]`,
    );
    await expect(
      mockContext.db.query.resourceVersionsInResource.findFirst({ where: { resourceId: { eq: resource.id } } }),
    ).resolves.toBeUndefined();
    await expect(mockContext.db.select().from(resourceVersionAssetsInResource)).resolves.toStrictEqual([]);
    await expect(listBlobNames(bucket, "")).resolves.toStrictEqual([]);
  });

  // A touch restarts the grace window of an asset nothing references, which rewrites the stored object with the time it
  // was touched. The digests are what a document of pasted hashes holds: each stored one is touched the first time a row
  // names it, and none a row already names is touched again, so the clock moved between the writes shows which happened
  test("touches an asset no row names once, and none a row already names", async () => {
    expect.hasAssertions();

    const digests = Array.from({ length: 5 }, (_value, index) => `${index}`.repeat(64));
    const blobNames = digests.map((digest) => getResourceFileBlobName(resource.id, digest));
    const serializedContent = JSON.stringify({ text: digests.join(" ") });
    await Promise.all(blobNames.map(async (blobName) => bucket.put(blobName, "value")));
    const readTouchedAts = async () =>
      Promise.all(blobNames.map(async (blobName) => (await bucket.head(blobName))?.customMetadata?.touchedAt));

    await writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Revisions, version: 1 },
      serializedContent,
    );

    expect(await readTouchedAts()).toStrictEqual(digests.map(() => new Date(0).toISOString()));

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 1 }));
    await writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Revisions, version: 2 },
      serializedContent,
    );

    expect(await readTouchedAts()).toStrictEqual(digests.map(() => new Date(0).toISOString()));
  });

  // The refusal needs to know whether the file is stored, which no row can say. A row named it when the revision was
  // Taken, and the file was deleted since
  test("refuses a published version naming a missing file that an earlier version's row names", async () => {
    expect.hasAssertions();

    const missingAssetUrl = getResourceAssetUrl(getResourceFileBlobName(resource.id, missingAssetHash));
    const serializedContent = JSON.stringify({ sections: [{ image: missingAssetUrl, type: "image" }] });
    await writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Revisions, version: 1 },
      serializedContent,
    );

    await expect(
      writeSnapshotVersion(
        mockContext.db,
        resource,
        { channel: SnapshotChannel.Published, version: 1 },
        serializedContent,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: Resource, cannot store content naming a missing asset]`,
    );
  });

  // Only a url of this resource's own file is held to the refusal. A bare id can be a digest in text rather than a file,
  // And another resource's url names a file this one never serves, so neither is refused, though both still keep the row
  test.each([
    ["a bare file id that no file backs", JSON.stringify({ fileId: missingAssetHash })],
    [
      "another resource's url to a file this one does not hold",
      JSON.stringify({ src: getResourceAssetUrl(getResourceFileBlobName(crypto.randomUUID(), missingAssetHash)) }),
    ],
  ])("stores a published version naming %s", async (_description, serializedContent) => {
    expect.hasAssertions();

    await writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Published, version: 1 },
      serializedContent,
    );

    await expect(
      mockContext.db
        .select({ assetHash: resourceVersionAssetsInResource.assetHash })
        .from(resourceVersionAssetsInResource),
    ).resolves.toStrictEqual([{ assetHash: missingAssetHash }]);
  });
});
