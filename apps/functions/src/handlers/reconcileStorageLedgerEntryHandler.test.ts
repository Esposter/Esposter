import type { Database, PublishEvent, R2ObjectCreatedQueueMessage } from "@esposter/db-schema";

import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { createUser } from "#src/services/shared/createUser.test";
import { getBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { PublishEventType, StorageBucket, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { MockBlockBlobClient, MockContainerDatabase, MockRestError } from "azure-mock";
import { createHash } from "node:crypto";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

// The meter lives in the app process, so publishing is the only thing this handler can do about it — which
// Makes the event it publishes the assertable half: it has to be the owner whose counter moved
const { publishMock } = vi.hoisted(() => ({
  publishMock: vi.fn<(event: PublishEvent) => Promise<void>>(),
}));

vi.mock(import("#src/services/server/publishToServer"), () => ({ publishToServer: publishMock }));

const hashOf = (value: string) => createHash("sha256").update(value).digest("hex");
const readResourceAssetNames = () => {
  const container = MockContainerDatabase.get(StorageBucket.ResourceAssets);
  assert.exists(container);
  return [...container.keys()];
};

describe(reconcileStorageLedgerEntryHandler, () => {
  const userId = crypto.randomUUID();
  const containerName = StorageBucket.ResourceAssets;
  const blobName = " ";
  const contentLength = 1;
  const eventTime = "2026-11-14T00:00:00.000Z";
  const createObjectCreatedMessage = (key: string, bucket: StorageBucket = containerName) =>
    ({ bucket, eventTime, object: { key, size: contentLength } }) satisfies R2ObjectCreatedQueueMessage;
  const readStorageBytesUsed = async () =>
    (await mockDb.query.usersInAuth.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
    await mockDb.delete(storageLedgerInStorage);
    await mockDb.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  const resourceId = crypto.randomUUID();
  const resourceAssetContent = " ";
  const matchingResourceAssetName = `${resourceId}/files/${hashOf(resourceAssetContent)}`;
  // The hash of the other canonical value, so the name describes bytes the blob does not hold
  const mismatchedResourceAssetName = `${resourceId}/files/${hashOf("")}`;
  const seedResourceAsset = async (name: string) => {
    const containerClient = await getContainerClient(StorageBucket.ResourceAssets);
    await containerClient.getBlockBlobClient(name).upload(resourceAssetContent, resourceAssetContent.length);
  };

  const createStorageLedgerEntry = (entry = { blobName, containerName }) =>
    mockDb
      .insert(storageLedgerInStorage)
      .values({ ...entry, countedBytes: 0, declaredBytes: 1, expiresAt: new Date(0), userId });

  test("charges the owner what storage reported", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(blobName));

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(publishMock).toHaveBeenCalledExactlyOnceWith({ type: PublishEventType.Storage, userId });
  });

  // A message attachment is named by its room and its id, with the filename after the separator.
  // Its uploader is charged, and no resource-asset check reads its bytes back
  test("charges a message attachment's uploader what storage reported", async () => {
    expect.hasAssertions();

    const messageBlobName = getBlobName(`${resourceId}/${crypto.randomUUID()}`, "filename");
    const messageContainerName = StorageBucket.MessageAssets;
    await createStorageLedgerEntry({ blobName: messageBlobName, containerName: messageContainerName });
    const downloadSpy = vi.spyOn(MockBlockBlobClient.prototype, "download");
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(messageBlobName, messageContainerName));

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(publishMock).toHaveBeenCalledExactlyOnceWith({ type: PublishEventType.Storage, userId });
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  // The counter settles in this process and is read in the app's, so a redelivery that moves nothing must not
  // Cost every one of the owner's devices a re-read
  test("stays quiet when a redelivered event moves nothing", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    const message = createObjectCreatedMessage(blobName);
    await reconcileStorageLedgerEntryHandler(message);
    vi.clearAllMocks();
    await reconcileStorageLedgerEntryHandler(message);

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(publishMock).not.toHaveBeenCalled();
  });

  test("ignores a bucket no upload reserves against", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(blobName, StorageBucket.PublicUserAssets));

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("a resource asset whose bytes match its name is kept", async () => {
    expect.hasAssertions();

    await seedResourceAsset(matchingResourceAssetName);
    const downloadSpy = vi.spyOn(MockBlockBlobClient.prototype, "download");
    const errorSpy = vi.spyOn(console, "error");
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(matchingResourceAssetName));

    expect(downloadSpy).toHaveBeenCalledExactlyOnceWith();
    expect(readResourceAssetNames()).toStrictEqual([matchingResourceAssetName]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("a resource asset whose bytes do not match its name is deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(console, "error");
    await reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(mismatchedResourceAssetName));

    expect(readResourceAssetNames()).toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(mismatchedResourceAssetName));
  });

  test("a redelivered message for a deleted resource asset is a no-op", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(console, "error");
    const message = createObjectCreatedMessage(mismatchedResourceAssetName);
    await reconcileStorageLedgerEntryHandler(message);
    await expect(reconcileStorageLedgerEntryHandler(message)).resolves.toBeUndefined();

    expect(readResourceAssetNames()).toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(mismatchedResourceAssetName));
  });

  // A failed read proves nothing about the bytes, so the blob is left for the redelivery rather than deleted on a guess
  test("a failed download of a resource asset is retried rather than deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    vi.spyOn(MockBlockBlobClient.prototype, "download").mockRejectedValueOnce(new MockRestError("", 503));

    await expect(
      reconcileStorageLedgerEntryHandler(createObjectCreatedMessage(mismatchedResourceAssetName)),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[MockRestError]`);
    expect(readResourceAssetNames()).toStrictEqual([mismatchedResourceAssetName]);
  });
});
