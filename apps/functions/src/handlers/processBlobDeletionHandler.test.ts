import type { EventGridEvent } from "@azure/functions";
import type { BlobDeletionEventGridData, Database } from "@esposter/db-schema";

import { processBlobDeletionHandler } from "#src/handlers/processBlobDeletionHandler";
import { getContainerClient } from "#src/services/getContainerClient";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageLedger, users } from "@esposter/db-schema";
import { MockBlockBlobClient, MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

// The handler releases each deleted blob's storage hold, so it reaches the database even when this suite
// Only cares about the blobs — the module-scope client would otherwise dial a real Postgres at import
vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/getContainerClient"), () => import("#src/services/getContainerClient.test"));

// Released bytes are published to the owner's meter, which lives in the app process — so the group published
// To is the only observable this handler has for the half of a deletion the owner actually watches
const { groupMock, sendToAllMock } = vi.hoisted(() => ({
  groupMock: vi.fn<(group: string) => void>(),
  sendToAllMock: vi.fn<(message: unknown) => Promise<void>>(),
}));

vi.mock(import("#src/services/getWebPubSubServiceClient"), () => ({
  getWebPubSubServiceClient: () =>
    ({
      group: (group: string) => {
        groupMock(group);
        return { sendToAll: sendToAllMock };
      },
    }) as never,
}));

const readContainer = () => {
  const container = MockContainerDatabase.get(AzureContainer.MessageAssets);
  assert.exists(container);
  return [...container.keys()];
};

const createEventGridEvent = (data: BlobDeletionEventGridData): EventGridEvent => ({
  data,
  dataVersion: "1.0",
  eventTime: "1970-01-01T00:00:00.000Z",
  eventType: "",
  id: crypto.randomUUID(),
  metadataVersion: "1",
  subject: "",
  topic: "",
});

const createEvent = (blobNames: string[]) =>
  createEventGridEvent({ blobNames, containerName: AzureContainer.MessageAssets });

const createPrefixEvent = (prefix: string, createdBefore: Date) =>
  createEventGridEvent({ containerName: AzureContainer.MessageAssets, createdBefore, prefix });

describe(processBlobDeletionHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const blobName = "";
  const secondBlobName = " ";
  const prefix = "a";
  const prefixedBlobName = `${prefix}/${blobName}`;
  const content = "";
  const userId = crypto.randomUUID();
  const countedBytes = 1;
  const seedBlob = async (name: string) => {
    const containerClient = await getContainerClient(AzureContainer.MessageAssets);
    await containerClient.getBlockBlobClient(name).upload(content, content.length);
  };
  // A blob storage has already reported, so the counter is carrying its bytes and a release gives them back
  const seedStorageLedgerEntry = (name: string) =>
    mockDb.insert(storageLedger).values({
      blobName: name,
      containerName: AzureContainer.MessageAssets,
      countedBytes,
      declaredBytes: countedBytes,
      expiresAt: new Date(),
      reconciledAt: new Date(),
      userId,
    });
  const readStorageBytesUsed = async () =>
    (await mockDb.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = await createMockDb();
    const createdAt = new Date();
    await mockDb.insert(users).values({
      createdAt,
      email: userId,
      emailVerified: true,
      id: userId,
      image: "",
      name: "name",
      updatedAt: createdAt,
    });
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    await mockDb.delete(storageLedger);
    await mockDb.update(users).set({ storageBytesUsed: 0 });
  });

  test("deletes every blob in the batch", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    await seedBlob(secondBlobName);
    await processBlobDeletionHandler(createEvent([blobName, secondBlobName]), context);

    expect(readContainer()).toStrictEqual([]);
  });

  test("tells the owner's meter what the deletion gave back", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    await seedStorageLedgerEntry(blobName);
    await mockDb.update(users).set({ storageBytesUsed: countedBytes });
    await processBlobDeletionHandler(createEvent([blobName]), context);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    expect(groupMock).toHaveBeenCalledExactlyOnceWith(userId);
    expect(sendToAllMock).toHaveBeenCalledExactlyOnceWith({ userId });
  });

  // A deletion whose blobs were never charged to anyone releases nothing, so there is no meter to tell
  test("publishes nothing when the deletion frees no accounted bytes", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    await processBlobDeletionHandler(createEvent([blobName]), context);

    expect(sendToAllMock).not.toHaveBeenCalled();
  });

  test("processBlobDeletionHandler is idempotent", async () => {
    expect.hasAssertions();

    const event = createEvent([blobName, secondBlobName]);
    await seedBlob(blobName);
    await processBlobDeletionHandler(event, context);

    await expect(processBlobDeletionHandler(event, context)).resolves.toBeUndefined();

    expect(readContainer()).toStrictEqual([]);
  });

  test("deletes every blob under the prefix", async () => {
    expect.hasAssertions();

    await seedBlob(prefixedBlobName);
    await processBlobDeletionHandler(
      createPrefixEvent(prefix, new Date(Date.now() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"))),
      context,
    );

    expect(readContainer()).toStrictEqual([]);
  });

  // Delivery is at-least-once and a dead-lettered event can be replayed hours later, so the set the handler
  // Enumerates is the one that existed when the deletion was published — a republish in between must survive
  test("keeps a blob written after the prefix deletion was published", async () => {
    expect.hasAssertions();

    await seedBlob(prefixedBlobName);
    await processBlobDeletionHandler(createPrefixEvent(prefix, new Date(0)), context);

    expect(readContainer()).toStrictEqual([prefixedBlobName]);
  });

  test("rethrows a failing delete so Event Grid redelivers the batch", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    vi.spyOn(MockBlockBlobClient.prototype, "deleteIfExists").mockRejectedValue(new Error(" "));

    await expect(
      processBlobDeletionHandler(createEvent([blobName]), context),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(readContainer()).toStrictEqual([blobName]);
  });

  // The redelivery re-resolves the set from what is still there, so a blob this attempt removed is one the
  // Retry can never name again — its bytes have to be given back now or they are held against its owner forever
  test("gives back the bytes of the blobs a failing batch did delete", async () => {
    expect.hasAssertions();

    await seedBlob(blobName);
    await seedBlob(secondBlobName);
    await seedStorageLedgerEntry(blobName);
    await seedStorageLedgerEntry(secondBlobName);
    await mockDb.update(users).set({ storageBytesUsed: countedBytes * 2 });
    vi.spyOn(MockBlockBlobClient.prototype, "deleteIfExists").mockRejectedValueOnce(new Error(" "));

    await expect(
      processBlobDeletionHandler(createEvent([blobName, secondBlobName]), context),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(readContainer()).toStrictEqual([blobName]);
    await expect(readStorageBytesUsed()).resolves.toBe(countedBytes);
    await expect(mockDb.query.storageLedger.findMany({ columns: { blobName: true } })).resolves.toStrictEqual([
      { blobName },
    ]);
  });
});
