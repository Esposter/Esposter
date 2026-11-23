import type { R2Bucket, R2ObjectBody } from "@cloudflare/workers-types";
import type { Database, R2ObjectCreatedQueueMessage } from "@esposter/db-schema";

import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";
import { getBucket } from "#src/services/storage/getBucket";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { getBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  clearMockBuckets,
  createUser,
  disposeMockBuckets,
  openMockBuckets,
  userObjectCalls,
} from "@esposter/db-mock/workers";
import {
  getResourceFileBlobName,
  QueueJob,
  StorageBucket,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { createHash } from "node:crypto";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));

// Handed out as a spy so one call can be given a bucket with only the method under test: Miniflare's bucket takes no
// Spy on its methods
vi.mock(import("#src/services/storage/getBucket"), async () => {
  const actual = await import("@esposter/db-mock/workers");
  return { ...actual, getBucket: vi.fn<typeof actual.getBucket>(actual.getBucket) };
});

// The meter lives in the app process, so the figure reaches it through the owner's User object
vi.mock(import("#src/services/user/getUserObject"), () => import("@esposter/db-mock/workers"));

const hashOf = (content: string) => createHash("sha256").update(content).digest("hex");
const readResourceAssetNames = async () => readBlobNames(StorageBucket.ResourceAssets);
// The one method a test needs, handed out once in place of the mock bucket the handler reads
const createBucketWith = (methods: Partial<R2Bucket>) => methods as R2Bucket;

describe(reconcileStorageLedgerEntryHandler, () => {
  const userId = v7();
  const storageBucket = StorageBucket.ResourceAssets;
  const contentLength = 1;
  const eventTime = new Date(0).toISOString();
  const createObjectCreatedMessage = (key: string, bucket: StorageBucket = storageBucket) =>
    ({ bucket, eventTime, object: { key, size: contentLength } }) satisfies R2ObjectCreatedQueueMessage;
  const readStorageUser = () => mockDb.query.usersInAuth.findFirst({ where: { id: { eq: userId } } });
  const readStorageBytesUsed = async () =>
    (await mockDb.query.usersInAuth.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets, StorageBucket.ResourceAssets]);
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

  const resourceId = v7();
  const resourceAssetContent = " ";
  const matchingResourceAssetName = getResourceFileBlobName(resourceId, hashOf(resourceAssetContent));
  // The default blob is a resource asset whose bytes match its name, so a case that never seeds it reads nothing back
  const blobName = matchingResourceAssetName;
  // The hash of the other canonical value, so the name describes bytes the blob does not hold
  const mismatchedResourceAssetName = getResourceFileBlobName(resourceId, hashOf(""));
  // The log names the hash of the bytes the blob holds, which is the name's hash of the other value
  const mismatchedResourceAssetLog = `${QueueJob.ReconcileStorageLedgerEntry} found a mismatched resource asset: ${JSON.stringify({ actualHash: hashOf(resourceAssetContent), blobName: mismatchedResourceAssetName })}`;
  const seedResourceAsset = async (name: string) => {
    const bucket = getBucket(StorageBucket.ResourceAssets);
    await bucket.put(name, resourceAssetContent);
  };

  const createStorageLedgerEntry = (
    entry: { blobName: string; storageBucket: StorageBucket } = { blobName, storageBucket },
  ) =>
    mockDb
      .insert(storageLedgerInStorage)
      .values({ ...entry, countedBytes: 0, declaredBytes: 1, expiresAt: new Date(0), userId });

  test("charges the owner what storage reported", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(blobName));

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    const storageUser = await readStorageUser();
    expect(userObjectCalls).toStrictEqual([{ args: [storageUser], method: "updateUsage", objectId: userId }]);
  });

  // A message attachment is named by its room and its id, with the filename after the separator.
  // Its uploader is charged, and no resource-asset check reads its bytes back
  test("charges a message attachment's uploader what storage reported", async () => {
    expect.hasAssertions();

    const messageBlobName = getBlobName(`${resourceId}/${v7()}`, "a");
    const messageStorageBucket = StorageBucket.MessageAssets;
    await createStorageLedgerEntry({ blobName: messageBlobName, storageBucket: messageStorageBucket });
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(messageBlobName, messageStorageBucket));

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    const storageUser = await readStorageUser();
    expect(userObjectCalls).toStrictEqual([{ args: [storageUser], method: "updateUsage", objectId: userId }]);
    expect(getBucket).not.toHaveBeenCalled();
  });

  // The counter settles in this process and is read in the app's, so a redelivery that moves nothing must not
  // Cost every one of the owner's devices a re-read
  test("stays quiet when a redelivered event moves nothing", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    const message = createObjectCreatedMessage(blobName);
    await reconcileStorageLedgerEntryHandler(message);
    vi.clearAllMocks();
    userObjectCalls.length = 0;
    await reconcileStorageLedgerEntryHandler(message);

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(userObjectCalls).toStrictEqual([]);
  });

  test("ignores a bucket no upload reserves against", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(blobName, StorageBucket.PublicUserAssets));

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  // A reserve names its bucket on the row it writes, so the reconcile follows that row and keeps no list of buckets to
  // Join
  test("charges a row in any bucket the ledger names", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry({ blobName, storageBucket: StorageBucket.UserAssets });
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(blobName, StorageBucket.UserAssets));

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
  });

  // A bucket name the storage enum does not name has no row to find, and is dropped rather than failing its delivery
  test("drops a notification from a bucket name the storage enum does not name", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await expect(
      reconcileStorageLedgerEntryHandler({ ...createObjectCreatedMessage(blobName), bucket: " " }),
    ).resolves.toBeUndefined();

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("a resource asset whose bytes match its name is kept", async () => {
    expect.hasAssertions();

    await seedResourceAsset(matchingResourceAssetName);
    const resourceAssetsBucket = getBucket(StorageBucket.ResourceAssets);
    const getSpy = vi.fn<(name: string) => Promise<null | R2ObjectBody>>((name) => resourceAssetsBucket.get(name));
    vi.mocked(getBucket).mockReturnValueOnce(createBucketWith({ get: getSpy }));
    const errorSpy = vi.spyOn(console, "error");
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(matchingResourceAssetName));

    expect(getSpy).toHaveBeenCalledExactlyOnceWith(matchingResourceAssetName);
    await expect(readResourceAssetNames()).resolves.toStrictEqual([matchingResourceAssetName]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("a resource asset whose bytes do not match its name is deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(console, "error");
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(mismatchedResourceAssetName));

    await expect(readResourceAssetNames()).resolves.toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(mismatchedResourceAssetLog);
  });

  test("a redelivered message for a deleted resource asset is a no-op", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(console, "error");
    const message = createObjectCreatedMessage(mismatchedResourceAssetName);
    await reconcileStorageLedgerEntryHandler(message);
    await expect(reconcileStorageLedgerEntryHandler(message)).resolves.toBeUndefined();

    await expect(readResourceAssetNames()).resolves.toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(mismatchedResourceAssetLog);
  });

  // A failed read proves nothing about the bytes, so the blob is left for the redelivery rather than deleted on a guess
  test("a failed read of a resource asset is retried rather than deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    vi.mocked(getBucket).mockReturnValueOnce(createBucketWith({ get: () => Promise.reject(new Error(" ")) }));

    await expect(
      reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(mismatchedResourceAssetName)),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    await expect(readResourceAssetNames()).resolves.toStrictEqual([mismatchedResourceAssetName]);
  });
});
