import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { getSnapshotVersionDeletes } from "#server/services/resource/snapshot/getSnapshotVersionDeletes";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { writeSnapshotVersion } from "#server/services/resource/snapshot/writeSnapshotVersion";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { ASSET_DECISION_CLOCK_MARGIN_MS, ASSET_GRACE_MS } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  QueueJob,
  StorageBucket,
  getResourceFileBlobName,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  resourceWorkingAssetsInResource,
  SnapshotChannel,
  SnapshotReason,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";

const getFileIdContent = (...fileIds: string[]) => JSON.stringify({ elements: fileIds.map((fileId) => ({ fileId })) });

// R2 stamps an upload with its own clock, not the one a test fakes, so the grace window is passed by moving the
// Clock on from the real time the asset was uploaded at
const setGraceElapsed = () => {
  vi.setSystemTime(Date.now() + ASSET_GRACE_MS);
};

describe(releaseResourceAssets, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: ResourceInResource;
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const assetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  const otherAssetHash = "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae";
  const assetBytes = new Uint8Array(1);
  const getAssetUrl = (hash: string) => getResourceAssetUrl(getResourceFileBlobName(resource.id, hash));
  const getAssetContent = (...hashes: string[]) =>
    JSON.stringify({ sections: hashes.map((hash) => ({ image: getAssetUrl(hash), type: "image" })) });
  const writeVersion = (version: number, serializedContent: string) =>
    writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Revisions, reason: SnapshotReason.BeforeImport, version },
      serializedContent,
    );
  // Uploaded at the moment the clock reads, which is what a re-upload stamps onto the object
  const uploadAsset = async (hash: string) => {
    await bucket.put(getResourceFileBlobName(resource.id, hash), assetBytes);
  };
  const deleteVersion = async (version: number) => {
    const [referenceRows, deletedVersions] = await mockContext.db.batch(
      getSnapshotVersionDeletes(
        mockContext.db,
        and(
          eq(resourceVersionsInResource.resourceId, resource.id),
          eq(resourceVersionsInResource.channel, SnapshotChannel.Revisions),
          eq(resourceVersionsInResource.version, version),
        ),
      ),
    );
    return { assetHashes: referenceRows.map(({ assetHash }) => assetHash), deletedVersions };
  };
  const readAssetHashes = () =>
    mockContext.db
      .select({ assetHash: resourceVersionAssetsInResource.assetHash })
      .from(resourceVersionAssetsInResource)
      .where(eq(resourceVersionAssetsInResource.resourceId, resource.id));

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
  });

  beforeEach(async () => {
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

  test("an asset embedded in a stored version is kept while the version lives", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockJobQueueDatabase.size).toBe(0);
    await expect(readAssetHashes()).resolves.toStrictEqual([{ assetHash }]);
  });

  test("collecting one version keeps an asset another version uses", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    await writeVersion(2, getAssetContent(assetHash));
    const { assetHashes } = await deleteVersion(1);
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, assetHashes);

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  // A whiteboard image stores the hash of its file as a bare id, so the url scan that once counted it never saw it
  test("an asset an element names by its bare file id is kept while the version lives", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getFileIdContent(assetHash));
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("an asset only an older retained version names is kept", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getFileIdContent(assetHash));
    await writeVersion(2, getFileIdContent());
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("an asset no retained version names is deleted", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getFileIdContent(otherAssetHash));
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(takeOne(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion) ?? [])).toStrictEqual({
      blobNames: [getResourceFileBlobName(resource.id, assetHash)],
      containerName: StorageBucket.ResourceAssets,
      decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
    });
  });

  test("an asset the working copy names is kept", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await mockContext.db.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  // The deletion is published to the handler that deletes the blob and releases its ledger entry, which is where the
  // Owner's storage usage falls
  test("collecting the last reference deletes the asset and credits the owner", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    const { assetHashes } = await deleteVersion(1);
    setGraceElapsed();

    await releaseResourceAssets(mockContext.db, resource.id, assetHashes);

    expect(takeOne(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion) ?? [])).toStrictEqual({
      blobNames: [getResourceFileBlobName(resource.id, assetHash)],
      containerName: StorageBucket.ResourceAssets,
      decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
    });
  });

  // An upload that dedupes onto an object touches it, and the save that names it can land a moment later
  test("a re-uploaded asset is kept through the grace window", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockJobQueueDatabase.size).toBe(0);
  });
});
