import type { BlobCreatedEventGridData, Database } from "@esposter/db-schema";

import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";
import { createEventGridEvent } from "#src/services/azure/createEventGridEvent.test";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, getBlobSubjectPrefix, storageLedger, users } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

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
    (await mockDb.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values(createUser(userId));
  });

  afterEach(async () => {
    await mockDb.delete(storageLedger);
    await mockDb.update(users).set({ storageBytesUsed: 0 });
  });

  const createStorageLedgerEntry = () =>
    mockDb.insert(storageLedger).values({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes: 1,
      expiresAt: new Date(0),
      userId,
    });

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
});
