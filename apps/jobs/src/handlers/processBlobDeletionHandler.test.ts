import type { R2Bucket } from "@cloudflare/workers-types";
import type { BlobDeletionQueueMessage, Database } from "@esposter/db-schema";

import { processBlobDeletionHandler } from "#src/handlers/processBlobDeletionHandler";
import { getBucket } from "#src/services/storage/getBucket";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { createMockDb } from "@esposter/db-mock";
import {
  clearMockBuckets,
  createUser,
  disposeMockBuckets,
  openMockBuckets,
  userObjectCalls,
} from "@esposter/db-mock/workers";
import { MAX_CONCURRENT_BLOB_DELETIONS, StorageBucket, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

// The handler releases each deleted blob's storage hold, so it reaches the database even when this suite
// Only cares about the blobs — the module-scope client would otherwise open a real database connection at import
vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));

// Handed out as a spy so one call can be given a bucket whose delete fails: Miniflare's bucket takes no spy on its methods
vi.mock(import("#src/services/storage/getBucket"), async () => {
  const actual = await import("@esposter/db-mock/workers");
  return { ...actual, getBucket: vi.fn<typeof actual.getBucket>(actual.getBucket) };
});

// The owner's meter lives in the app process, so the figure reaches it through the owner's User object
vi.mock(import("#src/services/user/getUserObject"), () => import("@esposter/db-mock/workers"));

const readContainer = () => readBlobNames(StorageBucket.MessageAssets);

const createEvent = (blobNames: string[]) =>
  ({ blobNames, storageBucket: StorageBucket.MessageAssets }) satisfies BlobDeletionQueueMessage;

const createPrefixEvent = (prefix: string, createdBefore: Date) =>
  ({ createdBefore, prefix, storageBucket: StorageBucket.MessageAssets }) satisfies BlobDeletionQueueMessage;

// The bucket the handler reads once, with only the delete under test: the handler's other reads are the mock's own
const createDeletingBucket = (deleteNames: (names: string | string[]) => Promise<void>) =>
  ({ delete: deleteNames }) as R2Bucket;

describe(processBlobDeletionHandler, () => {
  const roomId = v7();
  const blobName = `${roomId}/${v7()}`;
  const secondBlobName = `${roomId}/${v7()}`;
  const prefix = roomId;
  const userId = v7();
  const countedBytes = 1;
  // A blob storage has already reported, so the counter is carrying its bytes and a release gives them back
  const seedStorageLedgerEntry = (name: string) =>
    mockDb
      .insert(storageLedgerInStorage)
      .values({
        blobName: name,
        countedBytes,
        declaredBytes: countedBytes,
        expiresAt: new Date(0),
        reconciledAt: new Date(0),
        storageBucket: StorageBucket.MessageAssets,
        userId,
      });
  const readStorageUser = () => mockDb.query.usersInAuth.findFirst({ where: { id: { eq: userId } } });
  const readStorageBytesUsed = async () =>
    (await mockDb.query.usersInAuth.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets]);
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    userObjectCalls.length = 0;
    vi.restoreAllMocks();
    await clearMockBuckets();
    await mockDb.delete(storageLedgerInStorage);
    await mockDb.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes every blob in the batch", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await seedBlob(StorageBucket.MessageAssets, secondBlobName);
    await processBlobDeletionHandler(createEvent([blobName, secondBlobName]));

    await expect(readContainer()).resolves.toStrictEqual([]);
  });

  // A blob re-uploaded after the release decided it unreferenced is one the decision never saw, so the delete keeps it
  test("a named deletion keeps a blob re-uploaded after its decision", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler({
      blobNames: [blobName],
      decidedAt: new Date(0),
      storageBucket: StorageBucket.MessageAssets,
    } satisfies BlobDeletionQueueMessage);

    await expect(readContainer()).resolves.toStrictEqual([blobName]);
  });

  // A replayed deletion whose blob was written before its decision is the blob the decision judged, so it still goes
  test("a replayed named deletion for a blob last written before its decision still deletes it", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler({
      blobNames: [blobName],
      decidedAt: new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds")),
      storageBucket: StorageBucket.MessageAssets,
    } satisfies BlobDeletionQueueMessage);

    await expect(readContainer()).resolves.toStrictEqual([]);
  });

  test("tells the owner's meter what the deletion gave back", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await seedStorageLedgerEntry(blobName);
    await mockDb.update(usersInAuth).set({ storageBytesUsed: countedBytes });
    await processBlobDeletionHandler(createEvent([blobName]));

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    const storageUser = await readStorageUser();
    expect(userObjectCalls).toStrictEqual([{ args: [storageUser], method: "updateUsage", objectId: userId }]);
  });

  // A deletion whose blobs were never charged to anyone releases nothing, so there is no meter to tell
  test("updates no meter when the deletion frees no accounted bytes", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler(createEvent([blobName]));

    expect(userObjectCalls).toStrictEqual([]);
  });

  test("processBlobDeletionHandler is idempotent", async () => {
    expect.hasAssertions();

    const event = createEvent([blobName, secondBlobName]);
    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler(event);

    await expect(processBlobDeletionHandler(event)).resolves.toBeUndefined();

    await expect(readContainer()).resolves.toStrictEqual([]);
  });

  test("deletes every blob under the prefix", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler(
      createPrefixEvent(prefix, new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds"))),
    );

    await expect(readContainer()).resolves.toStrictEqual([]);
  });

  // Delivery is at-least-once and a dead-lettered event can be replayed hours later, so the set the handler
  // Enumerates is the one that existed when the deletion was published — a republish in between must survive
  test("keeps a blob written after the prefix deletion was published", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    await processBlobDeletionHandler(createPrefixEvent(prefix, new Date(0)));

    await expect(readContainer()).resolves.toStrictEqual([blobName]);
  });

  test("rethrows a failing delete so the queue redelivers the batch", async () => {
    expect.hasAssertions();

    await seedBlob(StorageBucket.MessageAssets, blobName);
    vi.mocked(getBucket).mockReturnValueOnce(createDeletingBucket(() => Promise.reject(new Error(" "))));

    await expect(processBlobDeletionHandler(createEvent([blobName]))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error:  ]`,
    );

    await expect(readContainer()).resolves.toStrictEqual([blobName]);
  });

  // The redelivery re-resolves the set from what is still there, so a blob this attempt removed is one the
  // Retry can never name again — its bytes have to be given back now or they are held against its owner forever
  test("gives back the bytes of the blobs a failing batch did delete", async () => {
    expect.hasAssertions();

    // Deletes go out a wave of MAX_CONCURRENT_BLOB_DELETIONS names at a time, so the last name is alone in its wave
    const blobNames = Array.from({ length: MAX_CONCURRENT_BLOB_DELETIONS + 1 }, (_value, index) => String(index));
    const lastBlobName = String(MAX_CONCURRENT_BLOB_DELETIONS);
    await Promise.all(blobNames.map(async (name) => seedBlob(StorageBucket.MessageAssets, name)));
    await Promise.all(blobNames.map(async (name) => seedStorageLedgerEntry(name)));
    await mockDb.update(usersInAuth).set({ storageBytesUsed: countedBytes * blobNames.length });
    const bucket = getBucket(StorageBucket.MessageAssets);
    vi.mocked(getBucket).mockReturnValueOnce(
      createDeletingBucket(async (names) =>
        Array.isArray(names) && names.includes(lastBlobName) ? Promise.reject(new Error(" ")) : bucket.delete(names),
      ),
    );

    await expect(processBlobDeletionHandler(createEvent(blobNames))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error:  ]`,
    );

    await expect(readContainer()).resolves.toStrictEqual([lastBlobName]);
    await expect(readStorageBytesUsed()).resolves.toBe(countedBytes);
    await expect(mockDb.query.storageLedgerInStorage.findMany({ columns: { blobName: true } })).resolves.toStrictEqual([
      { blobName: lastBlobName },
    ]);
  });
});
