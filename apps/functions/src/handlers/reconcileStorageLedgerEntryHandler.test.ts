import type { BlobCreatedEventGridData, Database } from "@esposter/db-schema";

import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";
import { createEventGridEvent } from "#src/services/azure/createEventGridEvent.test";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, getBlobSubjectPrefix, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
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
// Makes the group it publishes to the assertable half: it has to be the owner whose counter moved
const { groupMock, sendToAllMock } = vi.hoisted(() => ({
  groupMock: vi.fn<(group: string) => void>(),
  sendToAllMock: vi.fn<(message: unknown) => Promise<void>>(),
}));

vi.mock(import("#src/services/azure/getWebPubSubServiceClient"), () => ({
  getWebPubSubServiceClient: () =>
    ({
      group: (group: string) => {
        groupMock(group);
        return { sendToAll: sendToAllMock };
      },
    }) as never,
}));

const hashOf = (value: string) => createHash("sha256").update(value).digest("hex");
const readResourceAssetNames = () => {
  const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
  assert.exists(container);
  return [...container.keys()];
};

describe(reconcileStorageLedgerEntryHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.ResourceAssets;
  const blobName = " ";
  const contentLength = 1;
  const sequencer = "0";
  const createBlobCreatedEvent = (subject: string) =>
    createEventGridEvent({ data: { contentLength, sequencer } satisfies BlobCreatedEventGridData, subject });
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
  const createResourceAssetEvent = (name: string) =>
    createBlobCreatedEvent(`${getBlobSubjectPrefix(AzureContainer.ResourceAssets)}${name}`);
  const seedResourceAsset = async (name: string) => {
    const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
    await containerClient.getBlockBlobClient(name).upload(resourceAssetContent, resourceAssetContent.length);
  };

  const createStorageLedgerEntry = () =>
    mockDb
      .insert(storageLedgerInStorage)
      .values({ blobName, containerName, countedBytes: 0, declaredBytes: 1, expiresAt: new Date(0), userId });

  test("charges the owner what storage reported", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(
      createBlobCreatedEvent(`${getBlobSubjectPrefix(containerName)}${blobName}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(groupMock).toHaveBeenCalledExactlyOnceWith(userId);
    expect(sendToAllMock).toHaveBeenCalledExactlyOnceWith({ userId });
  });

  // The counter settles in this process and is read in the app's, so a redelivery that moves nothing must not
  // Cost every one of the owner's devices a re-read
  test("stays quiet when a redelivered event moves nothing", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    const event = createBlobCreatedEvent(`${getBlobSubjectPrefix(containerName)}${blobName}`);
    await reconcileStorageLedgerEntryHandler(event, context);
    vi.clearAllMocks();
    await reconcileStorageLedgerEntryHandler(event, context);

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(sendToAllMock).not.toHaveBeenCalled();
  });

  test("recovers a blob name storage percent-encoded into the subject", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(
      createBlobCreatedEvent(`${getBlobSubjectPrefix(containerName)}${encodeURIComponent(blobName)}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
    expect(sendToAllMock).toHaveBeenCalledExactlyOnceWith({ userId });
  });

  // A lone `%` is legal in a filename and decodes to nothing valid. The blob is simply one nobody reserved —
  // A clone or an upload from outside the chokepoints — so it is a no-op, never an event that poisons its queue
  test("ignores an unreserved blob whose name cannot be decoded", async () => {
    expect.hasAssertions();

    await expect(
      reconcileStorageLedgerEntryHandler(createBlobCreatedEvent(`${getBlobSubjectPrefix(containerName)}%`), context),
    ).resolves.toBeUndefined();
    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("ignores a container no upload reserves against", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntryHandler(
      createBlobCreatedEvent(`${getBlobSubjectPrefix(AzureContainer.MessageAssets)}${blobName}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("a resource asset whose bytes match its name is kept", async () => {
    expect.hasAssertions();

    await seedResourceAsset(matchingResourceAssetName);
    const downloadSpy = vi.spyOn(MockBlockBlobClient.prototype, "download");
    const errorSpy = vi.spyOn(context, "error");
    await reconcileStorageLedgerEntryHandler(createResourceAssetEvent(matchingResourceAssetName), context);

    expect(downloadSpy).toHaveBeenCalledExactlyOnceWith();
    expect(readResourceAssetNames()).toStrictEqual([matchingResourceAssetName]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("a resource asset whose bytes do not match its name is deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(context, "error");
    await reconcileStorageLedgerEntryHandler(createResourceAssetEvent(mismatchedResourceAssetName), context);

    expect(readResourceAssetNames()).toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(mismatchedResourceAssetName));
  });

  test("a redelivered event for a deleted resource asset is a no-op", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    const errorSpy = vi.spyOn(context, "error");
    const event = createResourceAssetEvent(mismatchedResourceAssetName);
    await reconcileStorageLedgerEntryHandler(event, context);
    await expect(reconcileStorageLedgerEntryHandler(event, context)).resolves.toBeUndefined();

    expect(readResourceAssetNames()).toStrictEqual([]);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(mismatchedResourceAssetName));
  });

  // A failed read proves nothing about the bytes, so the blob is left for the redelivery rather than deleted on a guess
  test("a failed download of a resource asset is retried rather than deleted", async () => {
    expect.hasAssertions();

    await seedResourceAsset(mismatchedResourceAssetName);
    vi.spyOn(MockBlockBlobClient.prototype, "download").mockRejectedValueOnce(new MockRestError("", 503));

    await expect(
      reconcileStorageLedgerEntryHandler(createResourceAssetEvent(mismatchedResourceAssetName), context),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[MockRestError]`);
    expect(readResourceAssetNames()).toStrictEqual([mismatchedResourceAssetName]);
  });
});
